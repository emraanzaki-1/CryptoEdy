import { randomBytes } from 'crypto'

/** Generates a unique 12-character alphanumeric referral code */
export function generateReferralCode(): string {
  return randomBytes(9).toString('base64url').slice(0, 12).toUpperCase()
}

/** Generates a secure 32-byte hex token for email verification / password reset */
export function generateSecureToken(): string {
  return randomBytes(32).toString('hex')
}
