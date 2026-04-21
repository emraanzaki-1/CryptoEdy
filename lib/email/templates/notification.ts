import { emailLayout, heading, paragraph, primaryButton, smallText } from './layout'

interface NotificationEmailProps {
  title: string
  body: string
  link?: string
  ctaLabel?: string
}

export function notificationTemplate({
  title,
  body,
  link,
  ctaLabel = 'View on CryptoEdy',
}: NotificationEmailProps): string {
  return emailLayout({
    previewText: body.slice(0, 120),
    children: `
      ${heading(title)}
      ${paragraph(body)}
      ${link ? `<div style="text-align:center;">${primaryButton(ctaLabel, link)}</div>` : ''}
      ${smallText('You can manage your notification preferences in your CryptoEdy settings.')}
    `,
  })
}
