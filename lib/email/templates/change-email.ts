import { emailLayout, primaryButton, heading, paragraph, divider, smallText } from './layout'

interface ChangeEmailProps {
  verifyUrl: string
  newEmail: string
}

export function changeEmailTemplate({ verifyUrl, newEmail }: ChangeEmailProps): string {
  return emailLayout({
    previewText: 'Confirm your new CryptoEdy email address.',
    children: `
      ${heading('Confirm email change')}
      ${paragraph('You requested to change your CryptoEdy account email to <strong>' + newEmail + '</strong>. Click the button below to confirm this change. This link expires in <strong>24 hours</strong>.')}
      <div style="text-align:center;">
        ${primaryButton('Confirm new email', verifyUrl)}
      </div>
      ${divider()}
      ${smallText("If you didn't request this change, you can safely ignore this email. Your current email address will remain unchanged.")}
    `,
  })
}
