import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getDb } from '@/lib/db'
import { users } from '@/lib/db/schema/users'
import { eq, and, ne } from 'drizzle-orm'

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/

/** GET /api/user/check-username?username=foo
 *  Returns { available: boolean, error?: string }
 */
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const username = req.nextUrl.searchParams.get('username')
  if (!username) {
    return NextResponse.json({ error: 'Missing username parameter' }, { status: 400 })
  }

  if (!USERNAME_REGEX.test(username)) {
    return NextResponse.json(
      {
        available: false,
        error: 'Username must be 3–20 characters and contain only letters, numbers, or underscores',
      },
      { status: 200 }
    )
  }

  const db = getDb()
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.username, username), ne(users.id, session.user.id)))
    .limit(1)

  return NextResponse.json({ available: existing.length === 0 })
}
