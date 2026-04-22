import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { CategoryHubClient } from '@/components/feed/category-hub-client'
import { mapPostToCardProps } from '@/lib/posts/mapToCardProps'
import { getBlurDataUrls } from '@/lib/utils/getBlurDataUrl'
import { getBookmarkedPostIds } from '@/lib/bookmarks/getBookmarkedPostIds'
import { auth } from '@/lib/auth'
import { getCategoryVisibility } from '@/lib/categories/visibility'
import type { Metadata } from 'next'

async function getParentCategory(parentSlug: string) {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'categories',
    where: { slug: { equals: parentSlug } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  return { payload, category: docs[0] }
}

async function getChildCategories(
  payload: ReturnType<typeof getPayload> extends Promise<infer T> ? T : never,
  parentId: string | number
) {
  const { docs } = await payload.find({
    collection: 'categories',
    where: { parent: { equals: parentId } },
    sort: 'weight',
    limit: 50,
    depth: 0,
    overrideAccess: true,
  })
  return docs as { id: string | number; name: string; slug: string; description?: string }[]
}

/* ── Hub page (all children) ─────────────────────────────────────── */

export async function renderCategoryHub(parentSlug: string, basePath: string) {
  const { payload, category } = await getParentCategory(parentSlug)
  if (!category) notFound()

  const visibility = await getCategoryVisibility()
  if (visibility.enabledById[String(category.id)] === false) notFound()

  const children = await getChildCategories(payload, category.id)
  // Filter out disabled children
  const enabledChildren = children.filter((c) => visibility.enabledById[String(c.id)] !== false)
  const categoryIds = [category.id, ...enabledChildren.map((c) => c.id)]

  const session = await auth()
  const bookmarkedIds = session?.user?.id
    ? await getBookmarkedPostIds(session.user.id)
    : new Set<string>()

  const { docs } = await payload.find({
    collection: 'posts',
    where: {
      status: { equals: 'published' },
      category: { in: categoryIds },
    },
    sort: '-publishedAt',
    depth: 2,
    limit: 24,
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

  const filters = enabledChildren.map((c) => ({ label: c.name, slug: c.slug }))
  const description = (category as unknown as { description?: string }).description ?? ''

  return (
    <CategoryHubClient
      articles={articles}
      filters={filters}
      title={(category as unknown as { name: string }).name}
      description={description}
      basePath={basePath}
      isAuthenticated={!!session?.user}
    />
  )
}

/* ── Child page (single child category) ──────────────────────────── */

export async function renderCategoryChild(parentSlug: string, childSlug: string, basePath: string) {
  const { payload, category: parent } = await getParentCategory(parentSlug)
  if (!parent) notFound()

  const visibility = await getCategoryVisibility()
  if (visibility.enabledById[String(parent.id)] === false) notFound()

  const children = await getChildCategories(payload, parent.id)
  const child = children.find((c) => c.slug === childSlug)
  if (!child) notFound()
  if (visibility.enabledById[String(child.id)] === false) notFound()

  const session = await auth()
  const bookmarkedIds = session?.user?.id
    ? await getBookmarkedPostIds(session.user.id)
    : new Set<string>()

  const { docs } = await payload.find({
    collection: 'posts',
    where: {
      status: { equals: 'published' },
      category: { equals: child.id },
    },
    sort: '-publishedAt',
    depth: 2,
    limit: 24,
    overrideAccess: true,
  })

  const imageUrls2 = docs
    .map((p) => {
      const fi = (p as Record<string, unknown>).featuredImage
      return fi && typeof fi === 'object' && 'url' in (fi as Record<string, unknown>)
        ? ((fi as Record<string, unknown>).url as string)
        : ''
    })
    .filter(Boolean)
  const blurMap2 = await getBlurDataUrls(imageUrls2)

  const articles = docs.map((post) => {
    const fi = (post as Record<string, unknown>).featuredImage
    const imageUrl =
      fi && typeof fi === 'object' && 'url' in (fi as Record<string, unknown>)
        ? ((fi as Record<string, unknown>).url as string)
        : ''
    return mapPostToCardProps(post as unknown as Record<string, unknown>, {
      isBookmarked: bookmarkedIds.has(String(post.id)),
      blurDataUrl: blurMap2[imageUrl],
    })
  })

  const enabledChildFilters = children.filter((c) => visibility.enabledById[String(c.id)] !== false)
  const filters = enabledChildFilters.map((c) => ({ label: c.name, slug: c.slug }))

  return (
    <CategoryHubClient
      articles={articles}
      filters={filters}
      activeFilter={child.name}
      title={child.name}
      description={
        child.description ?? (parent as unknown as { description?: string }).description ?? ''
      }
      basePath={basePath}
      isAuthenticated={!!session?.user}
    />
  )
}

/* ── Metadata generators ─────────────────────────────────────────── */

const BASE_URL = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

export async function generateCategoryHubMetadata(
  parentSlug: string,
  canonicalPath?: string
): Promise<Metadata> {
  const { category } = await getParentCategory(parentSlug)
  if (!category) return {}
  const cat = category as unknown as { name: string; description?: string; routePrefix?: string }
  const path = canonicalPath ?? cat.routePrefix ?? parentSlug
  return {
    title: `${cat.name} | CryptoEdy`,
    description: cat.description ?? undefined,
    alternates: { canonical: `${BASE_URL}/${path}` },
  }
}

export async function generateCategoryChildMetadata(
  parentSlug: string,
  childSlug: string,
  canonicalPath?: string
): Promise<Metadata> {
  const { payload, category: parent } = await getParentCategory(parentSlug)
  if (!parent) return {}
  const children = await getChildCategories(payload, parent.id)
  const child = children.find((c) => c.slug === childSlug)
  if (!child) return {}
  const parentName = (parent as unknown as { name: string }).name
  const parentPrefix = (parent as unknown as { routePrefix?: string }).routePrefix ?? parentSlug
  return {
    title: `${child.name} — ${parentName} | CryptoEdy`,
    description:
      child.description ?? (parent as unknown as { description?: string }).description ?? undefined,
    alternates: { canonical: `${BASE_URL}/${canonicalPath ?? `${parentPrefix}/${childSlug}`}` },
  }
}
