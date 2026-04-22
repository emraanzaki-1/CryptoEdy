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

interface ChangeEmailProps {
  verifyUrl: string
  newEmail: string
}

export function changeEmailTemplate({ verifyUrl, newEmail }: ChangeEmailProps): string {
  return emailLayout({
    previewText: 'Confirm your new CryptoEdy email address to complete the change.',
    children: `
      ${iconBadge(ICONS.mail, BRAND.iconBgBlue)}
      ${heading('Confirm email change')}
      ${paragraph('You requested to change your CryptoEdy account email to <strong>' + newEmail + '</strong>. Click the button below to confirm this change.')}
      ${warningText('This link expires in 24 hours.')}
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 8px;">
        <tr>
          <td>${primaryButton('Confirm New Email', verifyUrl)}</td>
        </tr>
      </table>
      ${divider()}
      ${smallText("If you didn't request this change, you can safely ignore this email &mdash; your current email address will remain unchanged.")}
    `,
  })
}
