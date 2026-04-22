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

interface VerifyEmailProps {
  verifyUrl: string
  email: string
}

export function verifyEmailTemplate({ verifyUrl, email }: VerifyEmailProps): string {
  return emailLayout({
    previewText: 'One click to verify your CryptoEdy account and get started.',
    children: `
      ${iconBadge(ICONS.mail, BRAND.iconBgBlue)}
      ${heading('Verify your email')}
      ${paragraph('Thanks for signing up. Click the button below to verify <strong>' + email + '</strong> and activate your account.')}
      ${warningText('This link expires in 24 hours.')}
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 8px;">
        <tr>
          <td>${primaryButton('Verify Email Address', verifyUrl)}</td>
        </tr>
      </table>
      ${divider()}
      ${smallText("If you didn't create a CryptoEdy account, you can safely ignore this email &mdash; the link will expire on its own.")}
    `,
  })
}
