import { emailLayout, primaryButton, heading, paragraph, divider, smallText } from './layout'

interface ResetPasswordProps {
  resetUrl: string
}

export function resetPasswordTemplate({ resetUrl }: ResetPasswordProps): string {
  return emailLayout({
    previewText: 'Reset your CryptoEdy password — this link expires in 1 hour.',
    children: `
      ${heading('Reset your password')}
      ${paragraph('We received a request to reset the password for your CryptoEdy account. Click the button below to choose a new password. This link expires in <strong>1 hour</strong>.')}
      <div style="text-align:center;">
        ${primaryButton('Reset Password', resetUrl)}
      </div>
      ${divider()}
      ${smallText("If you didn't request a password reset, you can safely ignore this email — your password won't change.")}
    `,
  })
}
