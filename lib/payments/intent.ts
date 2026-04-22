import crypto from 'crypto'

const INTENT_SECRET = process.env.PAYMENT_INTENT_SECRET ?? process.env.AUTH_SECRET ?? ''
const INTENT_TTL_SECONDS = 3600 // 1 hour

/**
 * Generate a signed payment intent token.
 * Embedded in CheckoutWidget's purchaseData so the webhook
 * can verify which user initiated the payment.
 */
export function generateIntentToken(userId: string): {
  intentToken: string
  userId: string
  ts: number
} {
  const ts = Math.floor(Date.now() / 1000)
  const payload = `${userId}:${ts}`
  const hmac = crypto.createHmac('sha256', INTENT_SECRET)
  hmac.update(payload, 'utf8')
  const intentToken = hmac.digest('hex')
  return { intentToken, userId, ts }
}

/**
 * Verify a signed payment intent token from the webhook purchaseData.
 * Returns the userId if valid, null if tampered or expired.
 */
export function verifyIntentToken(intentToken: string, userId: string, ts: number): string | null {
  const now = Math.floor(Date.now() / 1000)
  if (Math.abs(now - ts) > INTENT_TTL_SECONDS) {
    return null
  }

  const payload = `${userId}:${ts}`
  const hmac = crypto.createHmac('sha256', INTENT_SECRET)
  hmac.update(payload, 'utf8')
  const expectedToken = hmac.digest('hex')

  const isValid = crypto.timingSafeEqual(
    Buffer.from(intentToken, 'hex'),
    Buffer.from(expectedToken, 'hex')
  )

  return isValid ? userId : null
}
