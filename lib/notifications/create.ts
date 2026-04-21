import { getDb } from '@/lib/db'
import {
  notifications,
  users,
  notificationPreferences,
  marketingSubscribers,
} from '@/lib/db/schema'
import { eq, and, inArray, gt } from 'drizzle-orm'
import { canSendEmail } from './rate-limit'
import { sendNotificationEmail } from '@/lib/email/send'
import { emitToUser } from './emitter'
import type { NotificationType, NotificationSubtype } from '@/lib/db/schema/notifications'

interface CreateNotificationInput {
  userId: string
  type: NotificationType
  subtype: NotificationSubtype
  title: string
  body: string
  link?: string
  actorId?: string
  actorAvatar?: string
}

interface BroadcastNotificationInput {
  type: NotificationType
  subtype: NotificationSubtype
  title: string
  body: string
  link?: string
  actorId?: string
  actorAvatar?: string
  /** Filter recipients by role. If omitted, all users receive it. */
  filter?: {
    roles?: ('free' | 'pro' | 'analyst' | 'admin')[]
  }
  /** If true, also email active marketing_subscribers (content subtypes only). */
  emailNewsletter?: boolean
}

/**
 * Create a single notification for one user.
 * Checks preferences before inserting. Sends email if enabled + rate limit passes.
 */
export async function createNotification(input: CreateNotificationInput): Promise<void> {
  const db = getDb()
  const { userId, type, subtype, title, body, link, actorId, actorAvatar } = input

  // Check user preferences
  const [pref] = await db
    .select({ inApp: notificationPreferences.inApp, email: notificationPreferences.email })
    .from(notificationPreferences)
    .where(
      and(
        eq(notificationPreferences.userId, userId),
        eq(notificationPreferences.type, type),
        eq(notificationPreferences.subtype, subtype)
      )
    )
    .limit(1)

  const inAppEnabled = pref ? pref.inApp : true
  const emailEnabled = pref ? pref.email : true

  // Insert in-app notification
  if (inAppEnabled) {
    const [inserted] = await db
      .insert(notifications)
      .values({
        userId,
        type,
        subtype,
        title,
        body,
        link,
        actorId,
        actorAvatar,
      })
      .returning()

    // Push to any open SSE connections for this user
    emitToUser(userId, 'notification', inserted)
  }

  // Send email if enabled and rate limit allows
  if (emailEnabled && canSendEmail(userId, subtype)) {
    const [user] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (user) {
      await sendNotificationEmail({
        email: user.email,
        title,
        body,
        link: link ? `${process.env.NEXTAUTH_URL}${link}` : undefined,
        subtype,
      }).catch((err) => {
        console.error(`[notifications] Email send failed for user ${userId}:`, err)
      })
    }
  }
}

/**
 * Broadcast a notification to many users in batches of 500.
 * Checks per-user preferences. Optionally emails newsletter subscribers.
 */
export async function broadcastNotification(input: BroadcastNotificationInput): Promise<void> {
  const db = getDb()
  const { type, subtype, title, body, link, actorId, actorAvatar, filter, emailNewsletter } = input

  const BATCH_SIZE = 500
  const EMAIL_CONCURRENCY = 25
  let cursor: string | null = null
  const fullLink = link ? `${process.env.NEXTAUTH_URL}${link}` : undefined

  // Process users in batches
  while (true) {
    // Build WHERE conditions up-front, then apply once
    const conditions = []
    if (filter?.roles && filter.roles.length > 0) {
      conditions.push(inArray(users.role, filter.roles))
    }
    if (cursor) {
      conditions.push(gt(users.id, cursor))
    }

    let userQuery = db.select({ id: users.id, email: users.email }).from(users).$dynamic()
    if (conditions.length > 0) {
      userQuery = userQuery.where(and(...conditions))
    }

    const batch = await userQuery.orderBy(users.id).limit(BATCH_SIZE)

    if (batch.length === 0) break

    // Get user IDs that have inApp enabled for this subtype
    const userIds = batch.map((u) => u.id)

    const disabledPrefs = await db
      .select({ userId: notificationPreferences.userId })
      .from(notificationPreferences)
      .where(
        and(
          inArray(notificationPreferences.userId, userIds),
          eq(notificationPreferences.type, type),
          eq(notificationPreferences.subtype, subtype),
          eq(notificationPreferences.inApp, false)
        )
      )

    const disabledInApp = new Set(disabledPrefs.map((p) => p.userId))
    const inAppUserIds = userIds.filter((id) => !disabledInApp.has(id))

    // Batch insert notifications for in-app enabled users
    if (inAppUserIds.length > 0) {
      const inserted = await db
        .insert(notifications)
        .values(
          inAppUserIds.map((userId) => ({
            userId,
            type,
            subtype,
            title,
            body,
            link,
            actorId,
            actorAvatar,
          }))
        )
        .returning()

      // Push to any open SSE connections for each recipient
      for (const row of inserted) {
        emitToUser(row.userId, 'notification', row)
      }
    }

    // Send emails to users who have email enabled
    const emailDisabledPrefs = await db
      .select({ userId: notificationPreferences.userId })
      .from(notificationPreferences)
      .where(
        and(
          inArray(notificationPreferences.userId, userIds),
          eq(notificationPreferences.type, type),
          eq(notificationPreferences.subtype, subtype),
          eq(notificationPreferences.email, false)
        )
      )

    const disabledEmail = new Set(emailDisabledPrefs.map((p) => p.userId))

    const emailRecipients = batch.filter(
      (u) => !disabledEmail.has(u.id) && canSendEmail(u.id, subtype)
    )

    // Send emails with bounded concurrency
    await sendEmailsThrottled(
      emailRecipients.map((u) => u.email),
      {
        title,
        body,
        link: fullLink,
        subtype,
      },
      EMAIL_CONCURRENCY
    )

    cursor = batch[batch.length - 1].id
    if (batch.length < BATCH_SIZE) break
  }

  // Email newsletter subscribers for content subtypes (paginated)
  if (emailNewsletter && (subtype === 'research' || subtype === 'analysis')) {
    let subCursor: string | null = null

    while (true) {
      const subBatch = await db
        .select({ id: marketingSubscribers.id, email: marketingSubscribers.email })
        .from(marketingSubscribers)
        .where(
          subCursor
            ? and(eq(marketingSubscribers.active, true), gt(marketingSubscribers.id, subCursor))
            : eq(marketingSubscribers.active, true)
        )
        .orderBy(marketingSubscribers.id)
        .limit(BATCH_SIZE)

      if (subBatch.length === 0) break

      await sendEmailsThrottled(
        subBatch.map((s) => s.email),
        {
          title,
          body,
          link: fullLink,
          subtype,
        },
        EMAIL_CONCURRENCY
      )

      subCursor = subBatch[subBatch.length - 1].id
      if (subBatch.length < BATCH_SIZE) break
    }
  }
}

/**
 * Send emails with bounded concurrency to avoid overwhelming the provider.
 */
async function sendEmailsThrottled(
  emails: string[],
  payload: { title: string; body: string; link?: string; subtype: NotificationSubtype },
  concurrency: number
): Promise<void> {
  for (let i = 0; i < emails.length; i += concurrency) {
    const chunk = emails.slice(i, i + concurrency)
    await Promise.allSettled(
      chunk.map((email) =>
        sendNotificationEmail({
          email,
          title: payload.title,
          body: payload.body,
          link: payload.link,
          subtype: payload.subtype,
        })
      )
    )
  }
}
