import { NextRequest } from 'next/server'
import { notificationTemplate } from '@/lib/email/templates/notification'
import { verifyEmailTemplate } from '@/lib/email/templates/verify-email'
import { resetPasswordTemplate } from '@/lib/email/templates/reset-password'
import { changeEmailTemplate } from '@/lib/email/templates/change-email'

/**
 * DEV-ONLY — renders email templates in the browser for visual QA.
 * Blocked in production.
 *
 * Usage:
 *   /api/email-preview?t=verify-email
 *   /api/email-preview?t=reset-password
 *   /api/email-preview?t=change-email
 *   /api/email-preview?t=notification&subtype=subscription&link=/feed
 *   /api/email-preview?t=notification&subtype=subscription&link=/settings/plans
 *   /api/email-preview?t=notification&subtype=research&link=/articles/bitcoin-q2-outlook
 *   /api/email-preview?t=notification&subtype=analysis&link=/articles/eth-analysis
 */
export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return new Response('Not found', { status: 404 })
  }

  const { searchParams } = new URL(req.url)
  const t = searchParams.get('t') ?? 'notification'
  const subtype = searchParams.get('subtype') ?? 'subscription'
  const link = searchParams.get('link') ?? '/feed'

  const appUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  const unsubscribeUrl = `${appUrl}/settings/notifications`

  let html = ''

  switch (t) {
    case 'verify-email':
      html = verifyEmailTemplate({
        verifyUrl: `${appUrl}/verify-email?token=preview-token-123`,
        email: 'user@example.com',
      })
      break

    case 'reset-password':
      html = resetPasswordTemplate({
        resetUrl: `${appUrl}/reset-password?token=preview-token-123`,
      })
      break

    case 'change-email':
      html = changeEmailTemplate({
        verifyUrl: `${appUrl}/verify-email/change?token=preview-token-123`,
        newEmail: 'newemail@example.com',
      })
      break

    case 'notification':
    default: {
      const titles: Record<string, string> = {
        subscription_feed: 'Welcome to Pro!',
        subscription_plans: 'Your Pro membership expires in 7 days',
        research: 'New Research: Bitcoin Q2 Outlook',
        analysis: 'New Analysis: ETH Support Levels to Watch',
      }
      const bodies: Record<string, string> = {
        subscription_feed:
          'Your CryptoEdy Pro membership is now active. Enjoy full access to research reports, market analysis, and exclusive tools.',
        subscription_plans:
          'Renew now to keep uninterrupted access to premium research, market direction tools, and exclusive picks.',
        research:
          'Bitcoin is forming a textbook accumulation structure near the $58k range. On-chain data shows long-term holder supply hitting a 3-year high while exchange outflows accelerate — historically a precursor to sustained upside.',
        analysis:
          'ETH is holding the $2,800 support level with declining sell-side volume. The risk/reward favours longs here with a defined stop below $2,720 and a measured target near $3,400 over the next 4–6 weeks.',
      }

      const key =
        subtype === 'subscription'
          ? link.includes('/feed')
            ? 'subscription_feed'
            : 'subscription_plans'
          : subtype

      html = notificationTemplate({
        title: titles[key] ?? 'CryptoEdy Notification',
        body: bodies[key] ?? 'You have a new notification on CryptoEdy.',
        link: `${appUrl}${link}`,
        subtype,
        unsubscribeUrl,
      })
      break
    }
  }

  // Force light-mode colors so dark-mode browsers show the intended design.
  // Only override the specific color properties — NOT `all: revert` which destroys layout.
  // Append ?dark=1 to preview the dark mode version instead.
  const dark = searchParams.get('dark') === '1'
  const output = dark
    ? html
    : html.replace(
        '</head>',
        `<style>@media (prefers-color-scheme: dark) {
          .email-body  { background-color: #F0F4F8 !important; }
          .email-card  { background-color: #ffffff !important; }
          .email-heading { color: #0B1C30 !important; }
          .email-para  { color: #434656 !important; }
          .email-small { color: #6B7280 !important; }
          .email-footer { color: #6B7280 !important; }
        }</style></head>`
      )

  return new Response(output, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
