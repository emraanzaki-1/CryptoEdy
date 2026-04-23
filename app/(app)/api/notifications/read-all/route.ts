import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getDb } from '@/lib/db'
import { notifications } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import type { NotificationType } from '@/lib/db/schema/notifications'
import { checkCsrf } from '@/lib/auth/csrf'

const VALID_TYPES: NotificationType[] = ['content', 'community', 'feed', 'account']

/** PATCH — marks all unread notifications as read. Optionally scoped by ?type= */
export async function PATCH(req: NextRequest) {
  const csrf = checkCsrf(req)
  if (csrf) return csrf

  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const typeParam = searchParams.get('type')

  if (typeParam && !VALID_TYPES.includes(typeParam as NotificationType)) {
    return NextResponse.json({ error: 'Invalid type filter' }, { status: 400 })
  }

  try {
    const db = getDb()

    const conditions = [eq(notifications.userId, session.user.id), eq(notifications.isRead, false)]

    if (typeParam) {
      conditions.push(eq(notifications.type, typeParam as NotificationType))
    }

    await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(...conditions))

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[notifications] read-all error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
