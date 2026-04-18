import { getResend, FROM_EMAIL, isEmailConfigured } from './index'

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`

  if (!isEmailConfigured()) {
    console.warn(`[email] RESEND_API_KEY not set. Verification link: ${verifyUrl}`)
    return
  }

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Verify your CryptoEdy account',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #0052FF;">Welcome to CryptoEdy</h2>
        <p>Click the button below to verify your email address. This link expires in 24 hours.</p>
        <a href="${verifyUrl}" style="display:inline-block;background:#0052FF;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;margin:16px 0;">
          Verify Email
        </a>
        <p style="color:#6b7280;font-size:13px;">If you didn't create a CryptoEdy account, you can safely ignore this email.</p>
      </div>
    `,
  })
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`

  if (!isEmailConfigured()) {
    console.warn(`[email] RESEND_API_KEY not set. Reset link: ${resetUrl}`)
    return
  }

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Reset your CryptoEdy password',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #0052FF;">Reset your password</h2>
        <p>Click the button below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display:inline-block;background:#0052FF;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;margin:16px 0;">
          Reset Password
        </a>
        <p style="color:#6b7280;font-size:13px;">If you didn't request a password reset, you can safely ignore this email.</p>
      </div>
    `,
  })
}
