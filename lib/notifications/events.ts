/**
 * Notification event handlers.
 * Each function maps a platform event to one or more notifications via the create service.
 * Called from Payload hooks, cron jobs, and subscription logic.
 */

import { createNotification, broadcastNotification } from './create'

/* ─── Types ─────────────────────────────────────────────────────────────── */

export interface PostPublishedEvent {
  postId: string
  title: string
  category: string
  parentCategory: string
  isProOnly: boolean
  authorId: string
  slug: string
  publishedAt: string
}

/* ─── Post Published ────────────────────────────────────────────────────── */

/**
 * Fires when a Post transitions to published status.
 * Called from collections/Posts.ts afterChange hook.
 */
export async function onPostPublished(post: Record<string, unknown>): Promise<void> {
  // Resolve category name from populated relationship
  let categoryName = 'Unknown'
  let parentCategoryName = 'Unknown'
  if (post.category && typeof post.category === 'object' && post.category !== null) {
    const cat = post.category as Record<string, unknown>
    categoryName = (cat.name as string) ?? 'Unknown'
    // Resolve parent category
    if (cat.parent && typeof cat.parent === 'object' && cat.parent !== null) {
      parentCategoryName = ((cat.parent as Record<string, unknown>).name as string) ?? 'Unknown'
    } else if (typeof cat.parent === 'string') {
      parentCategoryName = categoryName // fallback — leaf is also parent
    }
  } else if (typeof post.category === 'string') {
    categoryName = post.category
  }

  const event: PostPublishedEvent = {
    postId: post.id as string,
    title: post.title as string,
    category: categoryName,
    parentCategory: parentCategoryName,
    isProOnly: (post.isProOnly as boolean) ?? false,
    authorId:
      typeof post.author === 'object' && post.author !== null
        ? ((post.author as Record<string, unknown>).id as string)
        : (post.author as string),
    slug: (post.slug as string) ?? '',
    publishedAt: post.publishedAt as string,
  }

  // Map parent category to notification subtype
  const subtype =
    parentCategoryName.toLowerCase() === 'research' ? ('research' as const) : ('analysis' as const)
  const link = `/articles/${event.slug}`

  if (event.isProOnly) {
    // Pro-only content → notify Pro, Analyst, Admin users only
    await broadcastNotification({
      type: 'content',
      subtype,
      title: `New ${event.parentCategory}: ${event.title}`,
      body: `A new ${categoryName.toLowerCase()} article is now available. Read the full analysis on CryptoEdy.`,
      link,
      filter: { roles: ['pro', 'analyst', 'admin'] },
      emailNewsletter: true,
    })
  } else {
    // Free content → notify all users
    await broadcastNotification({
      type: 'content',
      subtype,
      title: `New ${event.parentCategory}: ${event.title}`,
      body: `A new ${categoryName.toLowerCase()} article is now available on CryptoEdy.`,
      link,
      emailNewsletter: true,
    })
  }
}

/* ─── Subscription Events ───────────────────────────────────────────────── */

/**
 * Fires when a user's Pro subscription is activated (payment confirmed).
 * Called from subscription/payment verification logic (Sprint 5/6).
 */
export async function onSubscriptionActivated(userId: string): Promise<void> {
  await createNotification({
    userId,
    type: 'account',
    subtype: 'subscription',
    title: 'Welcome to Pro!',
    body: 'Your CryptoEdy Pro membership is now active. Enjoy full access to research reports, market analysis, and exclusive tools.',
    link: '/feed',
  })
}

/**
 * Fires when a user's subscription is approaching expiry.
 * Called from subscription management cron (Sprint 6).
 */
export async function onSubscriptionExpiring(userId: string, daysLeft: number): Promise<void> {
  await createNotification({
    userId,
    type: 'account',
    subtype: 'subscription',
    title: `Your Pro membership expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`,
    body: 'Renew now to keep uninterrupted access to premium research, market direction tools, and exclusive picks.',
    link: '/settings/plans',
  })
}

/**
 * Fires when a user's subscription has expired.
 * Called from subscription management cron (Sprint 6).
 */
export async function onSubscriptionExpired(userId: string): Promise<void> {
  await createNotification({
    userId,
    type: 'account',
    subtype: 'subscription',
    title: 'Your Pro membership has expired',
    body: 'You can still access free content on CryptoEdy. Renew anytime to regain full access.',
    link: '/settings/plans',
  })
}

/* ─── Referral Events ───────────────────────────────────────────────────── */

/**
 * Fires when a referred user converts (signs up or subscribes).
 * Called from referral reward logic (Sprint 6).
 */
export async function onReferralConverted(referrerId: string, referredName: string): Promise<void> {
  await createNotification({
    userId: referrerId,
    type: 'account',
    subtype: 'referral',
    title: 'Referral reward pending!',
    body: `${referredName} joined CryptoEdy through your referral link. Your $10 USDC reward is pending.`,
    link: '/settings/billing',
  })
}

/* ─── Airdrop Events ────────────────────────────────────────────────────── */

/**
 * Fires when a new airdrop guide is published.
 * Called from Payload Posts afterChange hook when category is airdrop-related.
 */
export async function onAirdropPublished(post: Record<string, unknown>): Promise<void> {
  const title = (post.title as string) ?? 'New Airdrop Guide'
  const slug = (post.slug as string) ?? ''

  await broadcastNotification({
    type: 'feed',
    subtype: 'picks',
    title: `New airdrop guide: ${title}`,
    body: 'A new airdrop opportunity has been published. Check it out before it expires.',
    link: `/articles/${slug}`,
    filter: { roles: ['pro', 'analyst', 'admin'] },
  })
}
