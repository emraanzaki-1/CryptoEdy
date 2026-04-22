/**
 * Payment provider abstraction.
 * Each provider implements this interface so we can swap/add providers
 * without touching activation logic, admin views, or billing UI.
 */

export type CheckoutResult =
  | { kind: 'redirect'; checkoutUrl: string; providerPaymentId: string }
  | {
      kind: 'embed'
      checkoutId: string
      embedConfig: Record<string, unknown>
      providerPaymentId: string
    }

export interface WebhookEvent {
  type: 'payment_success' | 'payment_failed' | 'payment_pending'
  txHash: string
  chain: string
  asset: string
  amount: number
  userId: string
  providerPaymentId: string
  walletAddress?: string
  recipientAddress?: string
}

export interface WebhookResult {
  valid: boolean
  event?: WebhookEvent
}

export interface PaymentProvider {
  /** Unique provider name, stored in payments.provider column */
  name: string

  /** Create a checkout session for a user */
  createCheckout(params: { userId: string; userEmail: string }): Promise<CheckoutResult>

  /** Verify webhook signature and parse payment event */
  verifyWebhook(request: Request): Promise<WebhookResult>
}
