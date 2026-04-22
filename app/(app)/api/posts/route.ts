import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { desc, eq } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { bookmarks } from '@/lib/db/schema'
import { mapPostToCardProps } from '@/lib/posts/mapToCardProps'
import { getBookmarkedPostIds } from '@/lib/bookmarks/getBookmarkedPostIds'
import { auth } from '@/lib/auth'
import { getCategoryVisibility } from '@/lib/categories/visibility'
import type { Where } from 'payload'

const MAX_LIMIT = 50
const DEFAULT_LIMIT = 12

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(searchParams.get('limit')) || DEFAULT_LIMIT))
  const categorySlug = searchParams.get('category') || undefined
  const tagSlug = searchParams.get('tag') || undefined
  const bookmarksOnly = searchParams.get('bookmarks') === 'true'

  const payload = await getPayload({ config: configPromise })

  // Auth — needed for bookmark flags and bookmark-only mode
  const session = await auth()
  const userId = session?.user?.id

  // --- Bookmarks-only mode (saved page) ---
  if (bookmarksOnly) {
    if (!userId) {
      return NextResponse.json({ docs: [], totalDocs: 0, totalPages: 0, page, hasNextPage: false })
    }

    const db = getDb()
    const allBookmarks = await db
      .select({ postId: bookmarks.postId })
      .from(bookmarks)
      .where(eq(bookmarks.userId, userId))
      .orderBy(desc(bookmarks.createdAt))

    const totalDocs = allBookmarks.length
    const totalPages = Math.ceil(totalDocs / limit)
    const hasNextPage = page < totalPages
    const pageBookmarks = allBookmarks.slice((page - 1) * limit, page * limit)

    if (pageBookmarks.length === 0) {
      return NextResponse.json({ docs: [], totalDocs, totalPages, page, hasNextPage })
    }

    const postIds = pageBookmarks.map((b) => b.postId)
    const { docs: posts } = await payload.find({
      collection: 'posts',
      where: { id: { in: postIds }, status: { equals: 'published' } },
      depth: 2,
      limit: postIds.length,
      overrideAccess: true,
    })

    const postMap = new Map(posts.map((p) => [p.id, p]))
    const visibility = await getCategoryVisibility()
    const articles = postIds
      .map((id) => postMap.get(id))
      .filter((p) => {
        if (!p) return false
        const catId =
          typeof (p as Record<string, unknown>).category === 'object'
            ? String(((p as Record<string, unknown>).category as { id: string | number }).id)
            : String((p as Record<string, unknown>).category)
        return visibility.enabledById[catId] !== false
      })
      .map((p) => mapPostToCardProps(p as Record<string, unknown>, { isBookmarked: true }))

    return NextResponse.json({ docs: articles, totalDocs, totalPages, page, hasNextPage })
  }

  // --- Standard posts mode (feed / tag pages) ---
  const where: Where = { status: { equals: 'published' } }

  // Exclude disabled categories
  const visibility = await getCategoryVisibility()
  if (visibility.disabledIds.length > 0) {
    where['category'] = { not_in: visibility.disabledIds }
  }

  // Category filter — resolve slug to IDs (parent → children)
  if (categorySlug) {
    const { docs: matchedCategories } = await payload.find({
      collection: 'categories',
      where: { slug: { equals: categorySlug } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    const matched = matchedCategories[0]
    if (matched) {
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
    }
  }

  // Tag filter
  if (tagSlug) {
    const { docs: tagDocs } = await payload.find({
      collection: 'tags',
      where: { slug: { equals: tagSlug } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const tag = tagDocs[0]
    if (tag) {
      where['tags'] = { contains: tag.id }
    }
  }

  const { docs, totalDocs, totalPages, hasNextPage } = await payload.find({
    collection: 'posts',
    where,
    sort: '-publishedAt',
    depth: 2,
    limit,
    page,
    overrideAccess: true,
  })

  const bookmarkedIds = userId ? await getBookmarkedPostIds(userId) : new Set<string>()

  const articles = docs.map((post) =>
    mapPostToCardProps(post as unknown as Record<string, unknown>, {
      isBookmarked: bookmarkedIds.has(String(post.id)),
    })
  )

  return NextResponse.json({ docs: articles, totalDocs, totalPages, page, hasNextPage })
}
