import crypto from 'crypto'
import type { PaymentProvider, CheckoutResult, WebhookResult } from './types'

const THIRDWEB_API_BASE = 'https://pay.thirdweb.com/api/v1'

/**
 * Thirdweb Checkout payment provider.
 *
 * Env vars required:
 * - THIRDWEB_SECRET_KEY: server-side API key
 * - NEXT_PUBLIC_THIRDWEB_CLIENT_ID: client-side key (used in checkout embed)
 * - THIRDWEB_WEBHOOK_SECRET: HMAC secret for verifying webhook signatures
 * - THIRDWEB_RECIPIENT_ADDRESS: wallet address that receives payments
 */
export class ThirdwebProvider implements PaymentProvider {
  name = 'thirdweb'

  private get secretKey(): string {
    const key = process.env.THIRDWEB_SECRET_KEY
    if (!key) throw new Error('THIRDWEB_SECRET_KEY is not set')
    return key
  }

  private get clientId(): string {
    const id = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID
    if (!id) throw new Error('NEXT_PUBLIC_THIRDWEB_CLIENT_ID is not set')
    return id
  }

  private get webhookSecret(): string {
    const secret = process.env.THIRDWEB_WEBHOOK_SECRET
    if (!secret) throw new Error('THIRDWEB_WEBHOOK_SECRET is not set')
    return secret
  }

  private get recipientAddress(): string {
    const addr = process.env.THIRDWEB_RECIPIENT_ADDRESS
    if (!addr) throw new Error('THIRDWEB_RECIPIENT_ADDRESS is not set')
    return addr
  }

  async createCheckout(params: { userId: string; userEmail: string }): Promise<CheckoutResult> {
    const res = await fetch(`${THIRDWEB_API_BASE}/checkout-link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-secret-key': this.secretKey,
      },
      body: JSON.stringify({
        title: 'CryptoEdy Pro — Annual Membership',
        description: '1 year of Pro access to CryptoEdy research platform',
        recipientAddress: this.recipientAddress,
        amount: '100',
        token: { symbol: 'USDC' },
        metadata: {
          userId: params.userId,
          userEmail: params.userEmail,
          product: 'pro-annual',
        },
        successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?payment=success`,
        cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/settings/plans`,
      }),
    })

    if (!res.ok) {
      const error = await res.text()
      throw new Error(`Thirdweb checkout creation failed: ${error}`)
    }

    const data = await res.json()

    return {
      kind: 'redirect',
      checkoutUrl: data.checkoutLink ?? data.url,
      providerPaymentId: data.id ?? data.checkoutId ?? crypto.randomUUID(),
    }
  }

  async verifyWebhook(request: Request): Promise<WebhookResult> {
    const signature =
      request.headers.get('x-thirdweb-signature') ?? request.headers.get('thirdweb-signature')
    const rawBody = await request.text()

    if (!signature) {
      return { valid: false }
    }

    // HMAC-SHA256 verification
    const hmac = crypto.createHmac('sha256', this.webhookSecret)
    hmac.update(rawBody, 'utf8')
    const expectedSignature = hmac.digest('hex')

    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    )

    if (!isValid) {
      return { valid: false }
    }

    const body = JSON.parse(rawBody)

    // Map thirdweb event types to our normalized types
    const eventType = this.mapEventType(body.type ?? body.event)
    if (!eventType) {
      // Unknown event type — acknowledge but don't process
      return { valid: true }
    }

    const paymentData = body.data ?? body.payload ?? body

    return {
      valid: true,
      event: {
        type: eventType,
        txHash: paymentData.transactionHash ?? paymentData.txHash ?? '',
        chain: this.normalizeChain(paymentData.chainId ?? paymentData.chain ?? ''),
        asset: paymentData.tokenSymbol ?? paymentData.asset ?? 'USDC',
        amount: parseFloat(paymentData.amount ?? paymentData.value ?? '100'),
        userId: paymentData.metadata?.userId ?? '',
        providerPaymentId: paymentData.id ?? paymentData.checkoutId ?? '',
        walletAddress: paymentData.buyerAddress ?? paymentData.fromAddress ?? undefined,
        recipientAddress: paymentData.recipientAddress ?? paymentData.toAddress ?? undefined,
      },
    }
  }

  private mapEventType(
    type: string
  ): 'payment_success' | 'payment_failed' | 'payment_pending' | null {
    if (!type) return null
    const normalized = type.toLowerCase()
    if (
      normalized.includes('success') ||
      normalized.includes('confirmed') ||
      normalized.includes('completed')
    ) {
      return 'payment_success'
    }
    if (normalized.includes('failed') || normalized.includes('error')) {
      return 'payment_failed'
    }
    if (normalized.includes('pending') || normalized.includes('created')) {
      return 'payment_pending'
    }
    return null
  }

  private normalizeChain(chainId: string | number): string {
    const chainMap: Record<string, string> = {
      '1': 'ethereum',
      '137': 'polygon',
      '42161': 'arbitrum',
      ethereum: 'ethereum',
      polygon: 'polygon',
      arbitrum: 'arbitrum',
      solana: 'solana',
    }
    return chainMap[String(chainId)] ?? String(chainId)
  }
}
