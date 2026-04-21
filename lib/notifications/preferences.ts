import { eq, and } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { notificationPreferences } from '@/lib/db/schema'
import type { NotificationType, NotificationSubtype } from '@/lib/db/schema/notifications'

/** All subtype definitions grouped by type — single source of truth. */
export const NOTIFICATION_SUBTYPES: Record<NotificationType, NotificationSubtype[]> = {
  content: ['research', 'analysis'],
  community: ['message', 'mention', 'reply'],
  feed: ['market_direction', 'picks'],
  account: ['subscription', 'referral'],
}

/** Flat list of all type+subtype pairs. */
export const ALL_PREFERENCE_ENTRIES = Object.entries(NOTIFICATION_SUBTYPES).flatMap(
  ([type, subtypes]) =>
    subtypes.map((subtype) => ({
      type: type as NotificationType,
      subtype,
    }))
)

export interface PreferenceEntry {
  type: NotificationType
  subtype: NotificationSubtype
  inApp: boolean
  email: boolean
}

export type GroupedPreferences = Record<
  NotificationType,
  Record<NotificationSubtype, { inApp: boolean; email: boolean }>
>

/**
 * Get all notification preferences for a user, grouped by type.
 * If rows are missing (pre-existing user), seeds defaults first.
 */
export async function getUserPreferences(userId: string): Promise<GroupedPreferences> {
  const db = getDb()

  const rows = await db
    .select({
      type: notificationPreferences.type,
      subtype: notificationPreferences.subtype,
      inApp: notificationPreferences.inApp,
      email: notificationPreferences.email,
    })
    .from(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId))

  // If no rows exist, seed defaults
  if (rows.length === 0) {
    await seedDefaultPreferences(userId)
    return buildDefaultGrouped()
  }

  // Build grouped result, filling in defaults for any missing subtypes
  const grouped = buildDefaultGrouped()
  for (const row of rows) {
    if (grouped[row.type] && grouped[row.type][row.subtype]) {
      grouped[row.type][row.subtype] = { inApp: row.inApp, email: row.email }
    }
  }

  return grouped
}

/**
 * Update a single preference toggle for a user.
 */
export async function updatePreference(
  userId: string,
  type: NotificationType,
  subtype: NotificationSubtype,
  channel: 'inApp' | 'email',
  enabled: boolean
): Promise<GroupedPreferences> {
  const db = getDb()

  // Ensure row exists
  await db.insert(notificationPreferences).values({ userId, type, subtype }).onConflictDoNothing()

  await db
    .update(notificationPreferences)
    .set({ [channel]: enabled, updatedAt: new Date() })
    .where(
      and(
        eq(notificationPreferences.userId, userId),
        eq(notificationPreferences.type, type),
        eq(notificationPreferences.subtype, subtype)
      )
    )

  return getUserPreferences(userId)
}

/**
 * Master toggle — update all subtypes within a category for a user.
 */
export async function updateCategoryPreferences(
  userId: string,
  type: NotificationType,
  channel: 'inApp' | 'email',
  enabled: boolean
): Promise<GroupedPreferences> {
  const db = getDb()
  const subtypes = NOTIFICATION_SUBTYPES[type]

  // Ensure all rows exist
  await db
    .insert(notificationPreferences)
    .values(subtypes.map((subtype) => ({ userId, type, subtype })))
    .onConflictDoNothing()

  await db
    .update(notificationPreferences)
    .set({ [channel]: enabled, updatedAt: new Date() })
    .where(and(eq(notificationPreferences.userId, userId), eq(notificationPreferences.type, type)))

  return getUserPreferences(userId)
}

/**
 * Seed default preferences for a new user (9 rows, all enabled).
 */
export async function seedDefaultPreferences(userId: string): Promise<void> {
  const db = getDb()

  await db
    .insert(notificationPreferences)
    .values(
      ALL_PREFERENCE_ENTRIES.map(({ type, subtype }) => ({
        userId,
        type,
        subtype,
      }))
    )
    .onConflictDoNothing()
}

/**
 * Check if a specific notification channel is enabled for a user.
 * Returns true if no preference row exists (default enabled).
 */
export async function isChannelEnabled(
  userId: string,
  type: NotificationType,
  subtype: NotificationSubtype,
  channel: 'inApp' | 'email'
): Promise<boolean> {
  const db = getDb()

  const [row] = await db
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

  if (!row) return true // default enabled
  return row[channel]
}

function buildDefaultGrouped(): GroupedPreferences {
  const grouped = {} as GroupedPreferences
  for (const [type, subtypes] of Object.entries(NOTIFICATION_SUBTYPES)) {
    const group = {} as Record<NotificationSubtype, { inApp: boolean; email: boolean }>
    for (const subtype of subtypes) {
      group[subtype] = { inApp: true, email: true }
    }
    grouped[type as NotificationType] = group
  }
  return grouped
}
