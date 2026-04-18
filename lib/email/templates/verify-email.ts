import { emailLayout, primaryButton, heading, paragraph, divider, smallText } from './layout'

interface VerifyEmailProps {
  verifyUrl: string
  email: string
}

export function verifyEmailTemplate({ verifyUrl, email }: VerifyEmailProps): string {
  return emailLayout({
    previewText: 'Verify your CryptoEdy email address to get started.',
    children: `
      ${heading('Verify your email')}
      ${paragraph('Thanks for signing up. Click the button below to verify <strong>' + email + '</strong> and activate your account. This link expires in <strong>24 hours</strong>.')}
      <div style="text-align:center;">
        ${primaryButton('Verify Email', verifyUrl)}
      </div>
      ${divider()}
      ${smallText("If you didn't create a CryptoEdy account, you can safely ignore this email. The link will expire on its own.")}
    `,
  })
}
