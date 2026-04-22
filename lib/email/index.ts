import { BrevoClient } from '@getbrevo/brevo'

// Sender identity for all outbound email.
export const FROM_EMAIL = { name: 'CryptoEdy', email: 'noreply@cryptoedy.com' }

let _brevo: BrevoClient | null = null

export function getBrevo(): BrevoClient {
  if (!_brevo) {
    if (!process.env.BREVO_API_KEY) {
      throw new Error('[CryptoEdy] BREVO_API_KEY is not set. Check your .env.local file.')
    }
    _brevo = new BrevoClient({ apiKey: process.env.BREVO_API_KEY })
  }
  return _brevo
}

export function isEmailConfigured(): boolean {
  return !!process.env.BREVO_API_KEY
}
