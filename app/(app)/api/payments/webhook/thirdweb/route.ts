import { Bridge } from 'thirdweb'
import { verifyAndActivate } from '@/lib/payments/verify-and-activate'
import { verifyIntentToken } from '@/lib/payments/intent'

/**
 * POST /api/payments/webhook/thirdweb
 *
 * Uses the official thirdweb SDK `Bridge.Webhook.parse()` for signature
 * verification. Extracts userId from the signed `purchaseData.intentToken`
 * that was embedded by the CheckoutWidget.
 */
export async function POST(request: Request) {
  const body = await request.text()
  const headers = Object.fromEntries(request.headers.entries())

  const webhookSecret = process.env.THIRDWEB_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('[webhook/thirdweb] THIRDWEB_WEBHOOK_SECRET not set')
    return new Response('Server configuration error', { status: 500 })
  }

  // Verify signature + timestamp using thirdweb SDK
  let payload: Record<string, unknown>
  try {
    payload = await Bridge.Webhook.parse(body, headers, webhookSecret)
  } catch (err) {
    console.warn('[webhook/thirdweb] Signature verification failed:', err)
    return new Response('Invalid signature', { status: 401 })
  }

  const data = (payload.data ?? payload) as Record<string, unknown>
  const status = String(data.status ?? '').toUpperCase()

  // Only process completed payments
  if (status !== 'COMPLETED') {
    return new Response('OK', { status: 200 })
  }

  // Verify recipient is our wallet
  const recipientAddress = process.env.THIRDWEB_RECIPIENT_ADDRESS
  const receiver = String(data.receiver ?? '')
  if (recipientAddress && receiver.toLowerCase() !== recipientAddress.toLowerCase()) {
    console.warn('[webhook/thirdweb] Receiver mismatch:', receiver)
    return new Response('Receiver mismatch', { status: 400 })
  }

  // Extract userId from signed purchaseData
  const purchaseData = data.purchaseData as Record<string, unknown> | undefined
  if (!purchaseData?.intentToken || !purchaseData?.userId || !purchaseData?.ts) {
    console.error('[webhook/thirdweb] Missing purchaseData fields')
    return new Response('Missing purchaseData', { status: 400 })
  }

  const userId = verifyIntentToken(
    String(purchaseData.intentToken),
    String(purchaseData.userId),
    Number(purchaseData.ts)
  )

  if (!userId) {
    console.error('[webhook/thirdweb] Invalid or expired intent token')
    return new Response('Invalid intent token', { status: 400 })
  }

  // Extract transaction details
  const transactions = (data.transactions ?? []) as Array<Record<string, unknown>>
  const txHash =
    transactions.length > 0
      ? String(transactions[transactions.length - 1].transactionHash ?? '')
      : String(data.transactionId ?? '')

  const destToken = data.destinationToken as Record<string, unknown> | undefined
  const chain = destToken?.chainId ? String(destToken.chainId) : ''
  const asset = destToken?.symbol ? String(destToken.symbol) : 'USDC'

  // Parse amount — destinationAmount is in smallest unit (e.g. 6 decimals for USDC)
  const decimals = Number(destToken?.decimals ?? 6)
  const rawAmount = BigInt(String(data.destinationAmount ?? '0'))
  const amount = Number(rawAmount) / Math.pow(10, decimals)

  const paymentId = String(data.paymentId ?? data.transactionId ?? '')
  const sender = String(data.sender ?? '')

  const result = await verifyAndActivate({
    userId,
    txHash,
    chain,
    asset,
    amount,
    provider: 'thirdweb',
    providerPaymentId: paymentId,
    walletAddress: sender,
    recipientAddress: receiver,
  })

  if (!result.success) {
    if (result.code === 'DUPLICATE_TX' || result.code === 'DUPLICATE_PROVIDER_PAYMENT') {
      return new Response('Already processed', { status: 200 })
    }
    console.error('[webhook/thirdweb] Activation failed:', result.error)
    return new Response('Processing error', { status: 500 })
  }

  return new Response('OK', { status: 200 })
}
