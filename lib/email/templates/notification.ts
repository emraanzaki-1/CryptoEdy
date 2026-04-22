import {
  emailLayout,
  heading,
  paragraph,
  primaryButton,
  divider,
  smallText,
  iconBadge,
  ICONS,
  BRAND,
} from './layout'

interface NotificationEmailProps {
  title: string
  body: string
  link?: string
  subtype?: string
  unsubscribeUrl?: string
}

interface SubtypeConfig {
  icon: string
  badgeBg: string
  ctaLabel: string
}

function getSubtypeConfig(subtype: string | undefined, link: string | undefined): SubtypeConfig {
  if (subtype === 'subscription') {
    if (link?.includes('/feed')) {
      return { icon: ICONS.star, badgeBg: BRAND.iconBgGreen, ctaLabel: 'Go to Feed' }
    }
    return { icon: ICONS.clock, badgeBg: BRAND.iconBgAmber, ctaLabel: 'Renew Now' }
  }
  if (subtype === 'research') {
    return { icon: ICONS.fileText, badgeBg: BRAND.iconBgBlue, ctaLabel: 'Read Report' }
  }
  if (subtype === 'analysis') {
    return { icon: ICONS.barChart, badgeBg: BRAND.iconBgBlue, ctaLabel: 'Read Analysis' }
  }
  return { icon: ICONS.mail, badgeBg: BRAND.iconBgBlue, ctaLabel: 'View on CryptoEdy' }
}

export function notificationTemplate({
  title,
  body,
  link,
  subtype,
  unsubscribeUrl,
}: NotificationEmailProps): string {
  const config = getSubtypeConfig(subtype, link)

  return emailLayout({
    previewText: body.slice(0, 120),
    unsubscribeUrl,
    children: `
      ${iconBadge(config.icon, config.badgeBg)}
      ${heading(title)}
      ${paragraph(body)}
      ${
        link
          ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 8px;">
             <tr>
               <td>${primaryButton(config.ctaLabel, link)}</td>
             </tr>
           </table>`
          : ''
      }
      ${divider()}
      ${smallText('You can <a href="' + (unsubscribeUrl ?? '#') + '" style="color:inherit;text-decoration:underline;">manage your notification preferences</a> in your account settings.')}
    `,
  })
}
