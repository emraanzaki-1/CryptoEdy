import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { FeedClient } from '@/components/feed/feed-client'
import { getNavCategories } from '@/lib/categories/getCategories'
import { getBookmarkedPostIds } from '@/lib/bookmarks/getBookmarkedPostIds'
import { mapPostToCardProps } from '@/lib/posts/mapToCardProps'
import { getBlurDataUrls } from '@/lib/utils/getBlurDataUrl'
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

  // Exclude categories marked excludeFromMainFeed (e.g. Education → /learn)
  if (!categorySlug) {
    const excludedParents = navCategories.filter((c) => c.excludeFromMainFeed)
    if (excludedParents.length > 0) {
      const allExcludedIds: (string | number)[] = []

      for (const parent of excludedParents) {
        const { docs: parentDoc } = await payload.find({
          collection: 'categories',
          where: { slug: { equals: parent.slug } },
          limit: 1,
          depth: 0,
          overrideAccess: true,
        })
        const parentId = parentDoc[0]?.id
        if (!parentId) continue

        allExcludedIds.push(parentId)

        const { docs: childDocs } = await payload.find({
          collection: 'categories',
          where: { parent: { equals: parentId } },
          limit: 200,
          depth: 0,
          overrideAccess: true,
        })
        const childIds = childDocs.map((c) => c.id)
        allExcludedIds.push(...childIds)

        // Also exclude grandchildren (e.g. Simply Explained, Videos under Crypto School)
        if (childIds.length > 0) {
          const { docs: grandchildren } = await payload.find({
            collection: 'categories',
            where: { parent: { in: childIds } },
            limit: 200,
            depth: 0,
            overrideAccess: true,
          })
          allExcludedIds.push(...grandchildren.map((c) => c.id))
        }
      }

      if (allExcludedIds.length > 0) {
        where['category'] = {
          ...(typeof where['category'] === 'object' ? where['category'] : {}),
          not_in: allExcludedIds,
        }
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

  const imageUrls = docs
    .map((p) => {
      const fi = (p as Record<string, unknown>).featuredImage
      return fi && typeof fi === 'object' && 'url' in (fi as Record<string, unknown>)
        ? ((fi as Record<string, unknown>).url as string)
        : ''
    })
    .filter(Boolean)

  const blurMap = await getBlurDataUrls(imageUrls)

  const articles = docs.map((post) => {
    const fi = (post as Record<string, unknown>).featuredImage
    const imageUrl =
      fi && typeof fi === 'object' && 'url' in (fi as Record<string, unknown>)
        ? ((fi as Record<string, unknown>).url as string)
        : ''
    return mapPostToCardProps(post as unknown as Record<string, unknown>, {
      isBookmarked: bookmarkedIds.has(String(post.id)),
      blurDataUrl: blurMap[imageUrl],
    })
  })

  // Exclude categories with dedicated hub pages from the feed filter pills
  const feedCategories = navCategories.filter((c) => !c.excludeFromMainFeed)
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
