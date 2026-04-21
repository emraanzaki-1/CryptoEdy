import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getDb } from '@/lib/db'
import { notifications } from '@/lib/db/schema'
import { eq, and, desc, lt } from 'drizzle-orm'
import type { NotificationType } from '@/lib/db/schema/notifications'

const VALID_TYPES: NotificationType[] = ['content', 'community', 'feed', 'account']
const DEFAULT_LIMIT = 20
const MAX_LIMIT = 50

/** GET — paginated notifications for the current user. Supports ?type= and ?cursor= */
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const typeParam = searchParams.get('type')
  const cursor = searchParams.get('cursor')
  const limitParam = parseInt(searchParams.get('limit') ?? '', 10)
  const limit = Number.isFinite(limitParam)
    ? Math.min(Math.max(limitParam, 1), MAX_LIMIT)
    : DEFAULT_LIMIT

  // Validate type filter if provided
  if (typeParam && !VALID_TYPES.includes(typeParam as NotificationType)) {
    return NextResponse.json({ error: 'Invalid type filter' }, { status: 400 })
  }

  try {
    const db = getDb()

    // Build conditions
    const conditions = [eq(notifications.userId, session.user.id)]

    if (typeParam) {
      conditions.push(eq(notifications.type, typeParam as NotificationType))
    }

    if (cursor) {
      // Cursor is a createdAt timestamp — fetch items older than cursor
      conditions.push(lt(notifications.createdAt, new Date(cursor)))
    }

    const items = await db
      .select()
      .from(notifications)
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt))
      .limit(limit + 1) // fetch one extra to determine if there are more

    const hasMore = items.length > limit
    const results = hasMore ? items.slice(0, limit) : items
    const nextCursor = hasMore ? results[results.length - 1].createdAt.toISOString() : null

    return NextResponse.json({ items: results, nextCursor })
  } catch (err) {
    console.error('[notifications] GET error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
