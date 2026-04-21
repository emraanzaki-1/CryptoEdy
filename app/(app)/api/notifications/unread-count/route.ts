import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getDb } from '@/lib/db'
import { notifications } from '@/lib/db/schema'
import { eq, and, count } from 'drizzle-orm'

/** GET — returns total unread count and per-type breakdown. */
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const db = getDb()

    // Get per-type unread counts in a single query
    const rows = await db
      .select({
        type: notifications.type,
        count: count(),
      })
      .from(notifications)
      .where(and(eq(notifications.userId, session.user.id), eq(notifications.isRead, false)))
      .groupBy(notifications.type)

    const byType: Record<string, number> = {
      content: 0,
      community: 0,
      feed: 0,
      account: 0,
    }

    let total = 0
    for (const row of rows) {
      byType[row.type] = row.count
      total += row.count
    }

    return NextResponse.json({ count: total, byType })
  } catch (err) {
    console.error('[notifications] unread-count error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
