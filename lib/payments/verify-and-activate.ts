import { getDb } from '@/lib/db'
import { payments, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { onSubscriptionActivated } from '@/lib/notifications/events'

interface ActivateInput {
  userId: string
  txHash: string
  chain: string
  asset: string
  amount: number
  provider: string
  providerPaymentId: string
  walletAddress?: string
  recipientAddress?: string
}

interface ActivateResult {
  success: true
  newRole: 'pro'
  expiresAt: Date
}

interface ActivateError {
  success: false
  error: string
  code: 'DUPLICATE_TX' | 'DUPLICATE_PROVIDER_PAYMENT' | 'AMOUNT_TOO_LOW' | 'DB_ERROR'
}

const MIN_PAYMENT_AMOUNT = 100 // USD

function logPaymentEvent(event: {
  result: 'success' | 'failure'
  userId: string
  txHash: string
  chain: string
  asset: string
  amount: number
  provider: string
  providerPaymentId: string
  failureReason?: string
}) {
  console.log(
    JSON.stringify({ timestamp: new Date().toISOString(), service: 'payments', ...event })
  )
}

/**
 * Core provider-agnostic activation logic.
 * Atomically records a confirmed payment and upgrades the user to Pro.
 * Called by whatever payment provider webhook/callback fires.
 *
 * Early renewal: if user is already Pro, extends from their current expiry
 * rather than resetting to now + 365.
 */
export async function verifyAndActivate(
  input: ActivateInput
): Promise<ActivateResult | ActivateError> {
  const db = getDb()
  const {
    userId,
    txHash,
    chain,
    asset,
    amount,
    provider,
    providerPaymentId,
    walletAddress,
    recipientAddress,
  } = input

  // Amount validation — reject underpayments
  if (amount < MIN_PAYMENT_AMOUNT) {
    logPaymentEvent({
      result: 'failure',
      userId,
      txHash,
      chain,
      asset,
      amount,
      provider,
      providerPaymentId,
      failureReason: `amount_too_low: ${amount}`,
    })
    return {
      success: false,
      error: `Payment amount ${amount} is below minimum ${MIN_PAYMENT_AMOUNT}`,
      code: 'AMOUNT_TOO_LOW',
    }
  }

  // Idempotency check 1: reject if tx hash already recorded
  const [existingTx] = await db
    .select({ id: payments.id })
    .from(payments)
    .where(eq(payments.txHash, txHash))
    .limit(1)

  if (existingTx) {
    logPaymentEvent({
      result: 'failure',
      userId,
      txHash,
      chain,
      asset,
      amount,
      provider,
      providerPaymentId,
      failureReason: 'duplicate_tx',
    })
    return { success: false, error: 'Transaction already processed', code: 'DUPLICATE_TX' }
  }

  // Idempotency check 2: reject if provider+paymentId already recorded
  if (providerPaymentId) {
    const [existingProvider] = await db
      .select({ id: payments.id })
      .from(payments)
      .where(eq(payments.providerPaymentId, providerPaymentId))
      .limit(1)

    if (existingProvider) {
      logPaymentEvent({
        result: 'failure',
        userId,
        txHash,
        chain,
        asset,
        amount,
        provider,
        providerPaymentId,
        failureReason: 'duplicate_provider_payment',
      })
      return {
        success: false,
        error: 'Provider payment already processed',
        code: 'DUPLICATE_PROVIDER_PAYMENT',
      }
    }
  }

  // Early renewal: extend from current expiry if user is still Pro
  const [currentUser] = await db
    .select({ subscriptionExpiry: users.subscriptionExpiry })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  const now = new Date()
  const baseDate =
    currentUser?.subscriptionExpiry && currentUser.subscriptionExpiry > now
      ? currentUser.subscriptionExpiry
      : now
  const expiresAt = new Date(baseDate)
  expiresAt.setDate(expiresAt.getDate() + 365)

  try {
    await db.transaction(async (tx) => {
      await tx.insert(payments).values({
        userId,
        txHash,
        chain,
        asset,
        amount: amount.toFixed(2),
        status: 'confirmed',
        provider,
        providerPaymentId: providerPaymentId || null,
        walletAddress: walletAddress ?? null,
        recipientAddress: recipientAddress ?? null,
        confirmedAt: new Date(),
      })

      await tx
        .update(users)
        .set({
          role: 'pro',
          subscriptionExpiry: expiresAt,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
    })
  } catch (err) {
    // Handle unique constraint violations as idempotent success
    const message = err instanceof Error ? err.message : String(err)
    if (message.includes('unique') || message.includes('duplicate')) {
      logPaymentEvent({
        result: 'failure',
        userId,
        txHash,
        chain,
        asset,
        amount,
        provider,
        providerPaymentId,
        failureReason: 'duplicate_tx_constraint',
      })
      return { success: false, error: 'Payment already processed', code: 'DUPLICATE_TX' }
    }
    logPaymentEvent({
      result: 'failure',
      userId,
      txHash,
      chain,
      asset,
      amount,
      provider,
      providerPaymentId,
      failureReason: `db_error: ${message}`,
    })
    console.error('[verifyAndActivate] DB transaction failed:', err)
    return { success: false, error: 'Failed to process payment', code: 'DB_ERROR' }
  }

  // Fire notification outside the transaction (non-critical)
  try {
    await onSubscriptionActivated(userId)
  } catch (err) {
    console.error('[verifyAndActivate] Notification failed (non-blocking):', err)
  }

  logPaymentEvent({
    result: 'success',
    userId,
    txHash,
    chain,
    asset,
    amount,
    provider,
    providerPaymentId,
  })
  return { success: true, newRole: 'pro', expiresAt }
}
