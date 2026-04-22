import type { PaymentProvider } from './types'
import { ThirdwebProvider } from './thirdweb'

const providers: Record<string, () => PaymentProvider> = {
  thirdweb: () => new ThirdwebProvider(),
}

/**
 * Returns the active payment provider based on PAYMENT_PROVIDER env var.
 * Defaults to 'thirdweb'.
 */
export function getActiveProvider(): PaymentProvider {
  const name = process.env.PAYMENT_PROVIDER ?? 'thirdweb'
  const factory = providers[name]
  if (!factory) {
    throw new Error(
      `Unknown payment provider: ${name}. Available: ${Object.keys(providers).join(', ')}`
    )
  }
  return factory()
}

/**
 * Returns a specific provider by name (for webhook routes that are provider-specific).
 */
export function getProvider(name: string): PaymentProvider {
  const factory = providers[name]
  if (!factory) {
    throw new Error(`Unknown payment provider: ${name}`)
  }
  return factory()
}

export type { PaymentProvider, CheckoutResult, WebhookEvent, WebhookResult } from './types'
