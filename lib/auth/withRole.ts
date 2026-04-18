import { auth } from '@/lib/auth'
import { getDb } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export type Role = 'guest' | 'free' | 'pro' | 'analyst' | 'admin'

const ROLE_HIERARCHY: Record<Role, number> = {
  guest: 0,
  free: 1,
  pro: 2,
  analyst: 3,
  admin: 4,
}

/**
 * Checks if a user's effective role meets the required minimum role.
 * Re-validates subscriptionExpiry on every call — an expired Pro user is treated as free.
 */
export async function checkRole(requiredRole: Role): Promise<{
  authorized: boolean
  effectiveRole: Role
  userId: string | null
}> {
  const session = await auth()

  if (!session?.user?.id) {
    return { authorized: false, effectiveRole: 'guest', userId: null }
  }

  // Re-fetch from DB to get fresh subscriptionExpiry
  const [user] = await getDb()
    .select({
      id: users.id,
      role: users.role,
      subscriptionExpiry: users.subscriptionExpiry,
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)

  if (!user) {
    return { authorized: false, effectiveRole: 'guest', userId: null }
  }

  // Downgrade expired Pro users to free
  let effectiveRole = user.role as Role
  if (effectiveRole === 'pro' && user.subscriptionExpiry) {
    const expired = new Date(user.subscriptionExpiry) < new Date()
    if (expired) effectiveRole = 'free'
  }

  const authorized = ROLE_HIERARCHY[effectiveRole] >= ROLE_HIERARCHY[requiredRole]
  return { authorized, effectiveRole, userId: user.id }
}

/**
 * API route guard — returns 401/403 JSON response if role check fails.
 */
export async function withRole(
  req: NextRequest,
  requiredRole: Role,
  handler: (req: NextRequest, userId: string) => Promise<NextResponse>
): Promise<NextResponse> {
  const { authorized, effectiveRole, userId } = await checkRole(requiredRole)

  if (effectiveRole === 'guest') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!authorized) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return handler(req, userId!)
}
