import { Resend } from 'resend'

// In development, use Resend's shared sender — no domain verification required.
// In production, switch to the verified domain address.
export const FROM_EMAIL =
  process.env.NODE_ENV === 'development'
    ? 'CryptoEdy <onboarding@resend.dev>'
    : 'CryptoEdy <noreply@cryptoedy.com>'

let _resend: Resend | null = null

export function getResend(): Resend {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('[CryptoEdy] RESEND_API_KEY is not set. Check your .env.local file.')
    }
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}

export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY
}
