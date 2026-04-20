'use server'

import { and, eq } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { bookmarks } from '@/lib/db/schema'
import { auth } from '@/lib/auth'

export async function toggleBookmark(postId: string): Promise<{ bookmarked: boolean }> {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Not authenticated')

  const userId = session.user.id
  const numericPostId = Number(postId)
  const db = getDb()

  const existing = await db
    .select({ id: bookmarks.id })
    .from(bookmarks)
    .where(and(eq(bookmarks.userId, userId), eq(bookmarks.postId, numericPostId)))
    .limit(1)

  if (existing.length > 0) {
    await db.delete(bookmarks).where(eq(bookmarks.id, existing[0].id))
    return { bookmarked: false }
  }

  await db.insert(bookmarks).values({ userId, postId: numericPostId })
  return { bookmarked: true }
}
