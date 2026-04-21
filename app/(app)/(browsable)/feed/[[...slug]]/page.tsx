import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { FeedClient } from '@/components/feed/feed-client'
import { getNavCategories } from '@/lib/categories/getCategories'
import { getBookmarkedPostIds } from '@/lib/bookmarks/getBookmarkedPostIds'
import { mapPostToCardProps } from '@/lib/posts/mapToCardProps'
import { auth } from '@/lib/auth'
import type { Where } from 'payload'

export default async function FeedPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params
  const categorySlug = slug?.[0]

  const payload = await getPayload({ config: configPromise })
  const navCategories = await getNavCategories()

  // Build the where clause — filter by category slug if provided
  const where: Where = { status: { equals: 'published' } }

  let activeFilter = 'All'

  if (categorySlug) {
    const { docs: matchedCategories } = await payload.find({
      collection: 'categories',
      where: { slug: { equals: categorySlug } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    const matched = matchedCategories[0]
    if (!matched) notFound()

    const isParent = !(matched as Record<string, unknown>).parent

    if (isParent) {
      const { docs: childDocs } = await payload.find({
        collection: 'categories',
        where: { parent: { equals: matched.id } },
        limit: 200,
        depth: 0,
        overrideAccess: true,
      })
      const childIds = childDocs.map((c) => c.id)
      where['category'] = { in: [matched.id, ...childIds] }
    } else {
      where['category'] = { equals: matched.id }
    }

    // Find the parent label for the active filter pill
    const parentMatch = navCategories.find((c) => c.slug === categorySlug)
    if (parentMatch) {
      activeFilter = parentMatch.label
    } else {
      for (const parent of navCategories) {
        if (parent.items.some((i) => i.slug === categorySlug)) {
          activeFilter = parent.label
          break
        }
      }
    }
  }

  const session = await auth()
  const bookmarkedIds = session?.user?.id
    ? await getBookmarkedPostIds(session.user.id)
    : new Set<string>()

  // Exclude Education posts from the main feed (Education has its own /learn section)
  if (!categorySlug) {
    const { docs: eduParentDocs } = await payload.find({
      collection: 'categories',
      where: { slug: { equals: 'education' } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const eduParentId = eduParentDocs[0]?.id
    if (eduParentId) {
      const { docs: eduChildren } = await payload.find({
        collection: 'categories',
        where: { parent: { equals: eduParentId } },
        limit: 200,
        depth: 0,
        overrideAccess: true,
      })
      // Also fetch grandchildren (e.g. Simply Explained, Videos under Crypto School)
      const childIds = eduChildren.map((c) => c.id)
      let grandchildIds: (string | number)[] = []
      if (childIds.length > 0) {
        const { docs: grandchildren } = await payload.find({
          collection: 'categories',
          where: { parent: { in: childIds } },
          limit: 200,
          depth: 0,
          overrideAccess: true,
        })
        grandchildIds = grandchildren.map((c) => c.id)
      }
      const eduCategoryIds = [eduParentId, ...childIds, ...grandchildIds]
      where['category'] = {
        ...(typeof where['category'] === 'object' ? where['category'] : {}),
        not_in: eduCategoryIds,
      }
    }
  }

  const { docs, hasNextPage } = await payload.find({
    collection: 'posts',
    where,
    sort: '-publishedAt',
    depth: 2,
    limit: 12,
    overrideAccess: true,
  })

  const articles = docs.map((post) =>
    mapPostToCardProps(post as unknown as Record<string, unknown>, {
      isBookmarked: bookmarkedIds.has(String(post.id)),
    })
  )

  // Exclude Education from feed filter pills (Education lives under /learn)
  const feedCategories = navCategories.filter((c) => c.slug !== 'education')
  const filters = feedCategories.map((c) => ({ label: c.label, slug: c.slug }))

  return (
    <FeedClient
      articles={articles}
      filters={filters}
      activeFilter={activeFilter}
      initialHasNextPage={hasNextPage}
      categorySlug={categorySlug}
      isAuthenticated={!!session?.user}
    />
  )
}
