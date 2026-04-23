import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getDb } from '@/lib/db'
import { notifications } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { checkCsrf } from '@/lib/auth/csrf'

/** PATCH — marks a single notification as read. */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const csrf = checkCsrf(req)
  if (csrf) return csrf

  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  if (!id) {
    return NextResponse.json({ error: 'Missing notification ID' }, { status: 400 })
  }

  try {
    const db = getDb()

    // userId check prevents reading others' notifications
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, id), eq(notifications.userId, session.user.id)))

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[notifications] read error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
