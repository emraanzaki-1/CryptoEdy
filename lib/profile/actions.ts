'use server'

import { auth } from '@/lib/auth'
import { getDb } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export interface ProfileData {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  username: string | null
  displayName: string | null
  bio: string | null
  avatarUrl: string | null
}

const PROFILE_SELECT = {
  id: users.id,
  email: users.email,
  firstName: users.firstName,
  lastName: users.lastName,
  username: users.username,
  displayName: users.displayName,
  bio: users.bio,
  avatarUrl: users.avatarUrl,
} as const

export async function getProfile(): Promise<
  { ok: true; data: ProfileData } | { ok: false; error: string }
> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: 'Unauthorized' }
  }

  const [profile] = await getDb()
    .select(PROFILE_SELECT)
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)

  if (!profile) {
    return { ok: false, error: 'Session expired — please log out and sign in again.' }
  }

  return { ok: true, data: profile }
}

export async function updateProfile(fields: {
  firstName?: string | null
  lastName?: string | null
  username?: string | null
  displayName?: string | null
  bio?: string | null
}): Promise<{ ok: true; data: ProfileData } | { ok: false; error: string }> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: 'Unauthorized' }
  }

  const updates: Record<string, unknown> = {}

  for (const key of ['firstName', 'lastName', 'username', 'displayName', 'bio'] as const) {
    if (key in fields) {
      const val = fields[key]
      updates[key] = typeof val === 'string' && val.trim() ? val.trim() : null
    }
  }

  if (Object.keys(updates).length === 0) {
    return { ok: false, error: 'No valid fields to update' }
  }

  // Validate username
  if (updates.username) {
    const stripped = (updates.username as string).replace(/^@/, '')
    if (stripped.length < 3 || stripped.length > 50) {
      return { ok: false, error: 'Username must be 3-50 characters' }
    }
    if (!/^[a-zA-Z0-9_]+$/.test(stripped)) {
      return { ok: false, error: 'Username can only contain letters, numbers, and underscores' }
    }
    updates.username = stripped

    const [existing] = await getDb()
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, stripped))
      .limit(1)

    if (existing && existing.id !== session.user.id) {
      return { ok: false, error: 'Username is already taken' }
    }
  }

  updates.updatedAt = new Date()

  const [updated] = await getDb()
    .update(users)
    .set(updates)
    .where(eq(users.id, session.user.id))
    .returning(PROFILE_SELECT)

  return { ok: true, data: updated }
}

export async function deleteAccount(
  confirmEmail: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: 'Unauthorized' }
  }

  // Verify email matches as confirmation
  const [user] = await getDb()
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)

  if (!user) {
    return { ok: false, error: 'User not found' }
  }

  if (user.email.toLowerCase() !== confirmEmail.trim().toLowerCase()) {
    return { ok: false, error: 'Email does not match. Please type your email exactly.' }
  }

  await getDb().delete(users).where(eq(users.id, session.user.id))

  return { ok: true }
}
