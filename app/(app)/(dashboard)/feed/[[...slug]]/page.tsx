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

  const { docs } = await payload.find({
    collection: 'posts',
    where,
    sort: '-publishedAt',
    depth: 2,
    limit: 20,
    overrideAccess: true,
  })

  const articles = docs.map((post) =>
    mapPostToCardProps(post as unknown as Record<string, unknown>, {
      isBookmarked: bookmarkedIds.has(String(post.id)),
    })
  )

  const filters = navCategories.map((c) => ({ label: c.label, slug: c.slug }))

  return <FeedClient articles={articles} filters={filters} activeFilter={activeFilter} />
}
