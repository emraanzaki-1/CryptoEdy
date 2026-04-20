import { eq } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { bookmarks } from '@/lib/db/schema'

export async function getBookmarkedPostIds(userId: string): Promise<Set<string>> {
  const db = getDb()

  const rows = await db
    .select({ postId: bookmarks.postId })
    .from(bookmarks)
    .where(eq(bookmarks.userId, userId))

  return new Set(rows.map((r) => String(r.postId)))
}
