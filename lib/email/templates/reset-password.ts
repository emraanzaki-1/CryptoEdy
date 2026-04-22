import {
  emailLayout,
  primaryButton,
  heading,
  paragraph,
  warningText,
  divider,
  smallText,
  iconBadge,
  ICONS,
  BRAND,
} from './layout'

interface ResetPasswordProps {
  resetUrl: string
}

export function resetPasswordTemplate({ resetUrl }: ResetPasswordProps): string {
  return emailLayout({
    previewText: 'Reset your CryptoEdy password — this link expires in 1 hour.',
    children: `
      ${iconBadge(ICONS.key, BRAND.iconBgAmber)}
      ${heading('Reset your password')}
      ${paragraph('We received a request to reset the password for your CryptoEdy account. Click the button below to choose a new password.')}
      ${warningText('This link expires in 1 hour.')}
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 8px;">
        <tr>
          <td>${primaryButton('Reset Password', resetUrl)}</td>
        </tr>
      </table>
      ${divider()}
      ${smallText("If you didn't request a password reset, you can safely ignore this email &mdash; your password won't change.")}
    `,
  })
}
