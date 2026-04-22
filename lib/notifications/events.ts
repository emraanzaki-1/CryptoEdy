/**
 * Notification event handlers.
 * Each function maps a platform event to one or more notifications via the create service.
 * Called from Payload hooks, cron jobs, and subscription logic.
 */

import { createNotification, broadcastNotification } from './create'
import type { NotificationSubtype } from '@/lib/db/schema/notifications'

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

/** Valid notification subtypes for content notifications. */
const CONTENT_SUBTYPES = new Set<string>(['research', 'analysis'])

/* ─── Post Published ────────────────────────────────────────────────────── */

/**
 * Fires when a Post transitions to published status.
 * Called from collections/Posts.ts afterChange hook.
 */
export async function onPostPublished(post: Record<string, unknown>): Promise<void> {
  // Resolve category name and parent routePrefix from populated relationship
  let categoryName = 'Unknown'
  let parentCategoryName = 'Unknown'
  let parentRoutePrefix: string | null = null
  if (post.category && typeof post.category === 'object' && post.category !== null) {
    const cat = post.category as Record<string, unknown>
    categoryName = (cat.name as string) ?? 'Unknown'
    // Resolve parent category — use routePrefix for subtype mapping (not name)
    if (cat.parent && typeof cat.parent === 'object' && cat.parent !== null) {
      const parent = cat.parent as Record<string, unknown>
      parentCategoryName = (parent.name as string) ?? 'Unknown'
      parentRoutePrefix = (parent.routePrefix as string) ?? null
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

  // Map parent routePrefix to notification subtype — uses the Payload field, not the category name
  const subtype: NotificationSubtype = CONTENT_SUBTYPES.has(parentRoutePrefix ?? '')
    ? (parentRoutePrefix as NotificationSubtype)
    : 'analysis' // fallback for categories without a matching subtype
  const link = `/articles/${event.slug}`

  const excerpt = (post.excerpt as string | undefined)?.trim()
  const body =
    excerpt ?? `A new ${categoryName.toLowerCase()} article is now available on CryptoEdy.`

  // All published posts notify free + pro users. Admin and analyst are excluded.
  await broadcastNotification({
    type: 'content',
    subtype,
    title: `New ${event.parentCategory}: ${event.title}`,
    body,
    link,
    filter: { roles: ['free', 'pro'] },
    emailNewsletter: true,
  })
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
