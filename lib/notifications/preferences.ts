import { eq } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { notificationPreferences } from '@/lib/db/schema'

const PREFERENCE_KEYS = ['dailyBrief', 'proAlerts', 'marketDirection', 'assetsPicks'] as const
export type PreferenceKey = (typeof PREFERENCE_KEYS)[number]

export function isValidPreferenceKey(key: string): key is PreferenceKey {
  return PREFERENCE_KEYS.includes(key as PreferenceKey)
}

const DEFAULTS: PreferencesResult = {
  dailyBrief: true,
  proAlerts: true,
  marketDirection: true,
  assetsPicks: true,
}

export type PreferencesResult = Record<PreferenceKey, boolean>

/**
 * Get notification preferences for a user.
 * If no row exists (pre-existing user), inserts defaults and returns them.
 */
export async function getPreferences(userId: string): Promise<PreferencesResult> {
  const db = getDb()

  const [existing] = await db
    .select({
      dailyBrief: notificationPreferences.dailyBrief,
      proAlerts: notificationPreferences.proAlerts,
      marketDirection: notificationPreferences.marketDirection,
      assetsPicks: notificationPreferences.assetsPicks,
    })
    .from(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId))
    .limit(1)

  if (existing) return existing

  // Upsert for pre-existing users who have no row yet
  await db.insert(notificationPreferences).values({ userId }).onConflictDoNothing()

  return { ...DEFAULTS }
}

/**
 * Update a single notification preference for a user.
 * Creates the row with defaults if it doesn't exist, then updates the specific key.
 */
export async function updatePreference(
  userId: string,
  key: PreferenceKey,
  enabled: boolean
): Promise<PreferencesResult> {
  const db = getDb()

  // Ensure row exists
  await db.insert(notificationPreferences).values({ userId }).onConflictDoNothing()

  // Update the specific column
  await db
    .update(notificationPreferences)
    .set({ [key]: enabled, updatedAt: new Date() })
    .where(eq(notificationPreferences.userId, userId))

  return getPreferences(userId)
}
