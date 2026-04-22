import { getResend, FROM_EMAIL, isEmailConfigured } from './index'
import { verifyEmailTemplate } from './templates/verify-email'
import { resetPasswordTemplate } from './templates/reset-password'
import { notificationTemplate } from './templates/notification'
import { changeEmailTemplate } from './templates/change-email'

/**
 * In development, redirect all outbound email to Resend's safe test addresses.
 * Labels let you tell email types apart in the Resend dashboard.
 * In production the real recipient address is used.
 */
function resolveRecipient(email: string, label: string): string {
  if (process.env.NODE_ENV === 'development') {
    return `delivered+${label}@resend.dev`
  }
  return email
}

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`

  if (!isEmailConfigured()) {
    console.warn(`[email] RESEND_API_KEY not set. Verification link: ${verifyUrl}`)
    return
  }

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: resolveRecipient(email, 'verify'),
    subject: 'Verify your CryptoEdy account',
    html: verifyEmailTemplate({ verifyUrl, email }),
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
    to: resolveRecipient(email, 'reset'),
    subject: 'Reset your CryptoEdy password',
    html: resetPasswordTemplate({ resetUrl }),
  })
}

export async function sendChangeEmailVerification(
  newEmail: string,
  verifyUrl: string
): Promise<void> {
  if (!isEmailConfigured()) {
    console.warn(`[email] RESEND_API_KEY not set. Email change link: ${verifyUrl}`)
    return
  }

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: resolveRecipient(newEmail, 'change-email'),
    subject: 'Confirm your new CryptoEdy email address',
    html: changeEmailTemplate({ verifyUrl, newEmail }),
  })
}

export async function sendNotificationEmail({
  email,
  title,
  body,
  link,
  subtype,
}: {
  email: string
  title: string
  body: string
  link?: string
  subtype: string
}): Promise<void> {
  if (!isEmailConfigured()) {
    console.warn(`[email] RESEND_API_KEY not set. Notification: ${title}`)
    return
  }

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: resolveRecipient(email, `notif-${subtype}`),
    subject: title,
    html: notificationTemplate({ title, body, link }),
  })
}
