import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { auth } from '@/lib/auth'
import { TagClient } from '@/components/feed/tag-client'
import { EmptyState } from '@/components/common/empty-state'
import { mapPostToCardProps } from '@/lib/posts/mapToCardProps'

export default async function SavedPage() {
  const session = await auth()
  if (!session?.user?.id) {
    return <EmptyState title="Sign in required" message="Sign in to view your saved articles." />
  }

  const payload = await getPayload({ config: configPromise })

  const { docs: bookmarks, hasNextPage } = await payload.find({
    collection: 'bookmarks',
    where: { userId: { equals: session.user.id } },
    sort: '-createdAt',
    depth: 3,
    limit: 12,
    overrideAccess: true,
  })

  const articles = bookmarks
    .map((bookmark) => {
      const post = bookmark.post
      if (!post || typeof post !== 'object' || !('title' in post)) return null

      const p = post as Record<string, unknown>
      if (p.status !== 'published') return null

      return mapPostToCardProps(p, { isBookmarked: true })
    })
    .filter((a) => a !== null)

  return (
    <div className="mx-auto flex w-full flex-col gap-8">
      <div>
        <h1 className="text-on-surface text-2xl leading-tight font-bold tracking-[-0.04em] lg:text-3xl">
          Saved articles
        </h1>
      </div>

      <TagClient
        tagName=""
        articles={articles}
        emptyTitle="No saved articles"
        emptyMessage="Articles you bookmark will appear here. Look for the bookmark icon on articles in your feed."
        initialHasNextPage={hasNextPage}
        fetchUrl="/api/posts?bookmarks=true&limit=12"
      />
    </div>
  )
}
