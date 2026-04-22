import { getBrevo, FROM_EMAIL, isEmailConfigured } from './index'
import { verifyEmailTemplate } from './templates/verify-email'
import { resetPasswordTemplate } from './templates/reset-password'
import { notificationTemplate } from './templates/notification'
import { changeEmailTemplate } from './templates/change-email'

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`

  if (!isEmailConfigured()) {
    console.warn(`[email] BREVO_API_KEY not set. Verification link: ${verifyUrl}`)
    return
  }

  await getBrevo().transactionalEmails.sendTransacEmail({
    sender: FROM_EMAIL,
    to: [{ email }],
    subject: 'Verify your CryptoEdy account',
    htmlContent: verifyEmailTemplate({ verifyUrl, email }),
  })
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`

  if (!isEmailConfigured()) {
    console.warn(`[email] BREVO_API_KEY not set. Reset link: ${resetUrl}`)
    return
  }

  await getBrevo().transactionalEmails.sendTransacEmail({
    sender: FROM_EMAIL,
    to: [{ email }],
    subject: 'Reset your CryptoEdy password',
    htmlContent: resetPasswordTemplate({ resetUrl }),
  })
}

export async function sendChangeEmailVerification(
  newEmail: string,
  verifyUrl: string
): Promise<void> {
  if (!isEmailConfigured()) {
    console.warn(`[email] BREVO_API_KEY not set. Email change link: ${verifyUrl}`)
    return
  }

  await getBrevo().transactionalEmails.sendTransacEmail({
    sender: FROM_EMAIL,
    to: [{ email: newEmail }],
    subject: 'Confirm your new CryptoEdy email address',
    htmlContent: changeEmailTemplate({ verifyUrl, newEmail }),
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
    console.warn(`[email] BREVO_API_KEY not set. Notification: ${title}`)
    return
  }

  const appUrl = process.env.NEXTAUTH_URL ?? 'https://cryptoedy.com'
  const unsubscribeUrl = `${appUrl}/settings/notifications`

  await getBrevo().transactionalEmails.sendTransacEmail({
    sender: FROM_EMAIL,
    to: [{ email }],
    subject: title,
    htmlContent: notificationTemplate({ title, body, link, subtype, unsubscribeUrl }),
    headers: {
      'List-Unsubscribe': `<${unsubscribeUrl}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
    tags: [`notif-${subtype}`],
  })
}
