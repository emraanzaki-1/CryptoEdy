import { desc, eq } from 'drizzle-orm'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { auth } from '@/lib/auth'
import { getDb } from '@/lib/db'
import { bookmarks } from '@/lib/db/schema'
import { TagClient } from '@/components/feed/tag-client'
import { EmptyState } from '@/components/common/empty-state'
import { mapPostToCardProps } from '@/lib/posts/mapToCardProps'
import { PageHeading } from '@/components/common/page-heading'

export default async function SavedPage() {
  const session = await auth()
  if (!session?.user?.id) {
    return <EmptyState title="Sign in required" message="Sign in to view your saved articles." />
  }

  const db = getDb()
  const userBookmarks = await db
    .select({ postId: bookmarks.postId })
    .from(bookmarks)
    .where(eq(bookmarks.userId, session.user.id))
    .orderBy(desc(bookmarks.createdAt))
    .limit(12)

  if (userBookmarks.length === 0) {
    return (
      <div className="mx-auto flex w-full flex-col gap-8">
        <PageHeading>Saved articles</PageHeading>
        <EmptyState
          title="No saved articles"
          message="Articles you bookmark will appear here. Look for the bookmark icon on articles in your feed."
        />
      </div>
    )
  }

  const postIds = userBookmarks.map((b) => b.postId)
  const payload = await getPayload({ config: configPromise })

  const { docs: posts } = await payload.find({
    collection: 'posts',
    where: {
      id: { in: postIds },
      status: { equals: 'published' },
    },
    depth: 2,
    limit: postIds.length,
    overrideAccess: true,
  })

  // Preserve bookmark order
  const postMap = new Map(posts.map((p) => [p.id, p]))
  const articles = postIds
    .map((id) => postMap.get(id))
    .filter((p) => p != null)
    .map((p) => mapPostToCardProps(p as Record<string, unknown>, { isBookmarked: true }))

  return (
    <div className="mx-auto flex w-full flex-col gap-8">
      <PageHeading>Saved articles</PageHeading>

      <TagClient
        tagName=""
        articles={articles}
        emptyTitle="No saved articles"
        emptyMessage="Articles you bookmark will appear here. Look for the bookmark icon on articles in your feed."
        initialHasNextPage={false}
        fetchUrl="/api/posts?bookmarks=true&limit=12"
      />
    </div>
  )
}
