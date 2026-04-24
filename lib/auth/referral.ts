import { createHmac, randomBytes } from 'crypto'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

/** Generates a deterministic 12-character alphanumeric referral code from an email address */
export function generateReferralCode(email: string): string {
  const secret = process.env.REFERRAL_SECRET
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('REFERRAL_SECRET must be set in production')
  }
  const hash = createHmac('sha256', secret ?? 'referral-secret-dev')
    .update(email.toLowerCase().trim())
    .digest()
  return Array.from(hash.subarray(0, 12), (b) => CHARS[b % 36]).join('')
}

/** Generates a secure 32-byte hex token for email verification / password reset */
export function generateSecureToken(): string {
  return randomBytes(32).toString('hex')
}
