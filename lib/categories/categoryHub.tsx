import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { CategoryHubClient } from '@/components/feed/category-hub-client'
import { mapPostToCardProps } from '@/lib/posts/mapToCardProps'
import { getBookmarkedPostIds } from '@/lib/bookmarks/getBookmarkedPostIds'
import { auth } from '@/lib/auth'
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

  const children = await getChildCategories(payload, category.id)
  const categoryIds = [category.id, ...children.map((c) => c.id)]

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

  const articles = docs.map((post) =>
    mapPostToCardProps(post as unknown as Record<string, unknown>, {
      isBookmarked: bookmarkedIds.has(String(post.id)),
    })
  )

  const filters = children.map((c) => ({ label: c.name, slug: c.slug }))
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

  const children = await getChildCategories(payload, parent.id)
  const child = children.find((c) => c.slug === childSlug)
  if (!child) notFound()

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

  const articles = docs.map((post) =>
    mapPostToCardProps(post as unknown as Record<string, unknown>, {
      isBookmarked: bookmarkedIds.has(String(post.id)),
    })
  )

  const filters = children.map((c) => ({ label: c.name, slug: c.slug }))

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

export async function generateCategoryHubMetadata(parentSlug: string): Promise<Metadata> {
  const { category } = await getParentCategory(parentSlug)
  if (!category) return {}
  const cat = category as unknown as { name: string; description?: string }
  return {
    title: `${cat.name} | CryptoEdy`,
    description: cat.description ?? undefined,
  }
}

export async function generateCategoryChildMetadata(
  parentSlug: string,
  childSlug: string
): Promise<Metadata> {
  const { payload, category: parent } = await getParentCategory(parentSlug)
  if (!parent) return {}
  const children = await getChildCategories(payload, parent.id)
  const child = children.find((c) => c.slug === childSlug)
  if (!child) return {}
  const parentName = (parent as unknown as { name: string }).name
  return {
    title: `${child.name} — ${parentName} | CryptoEdy`,
    description:
      child.description ?? (parent as unknown as { description?: string }).description ?? undefined,
  }
}
