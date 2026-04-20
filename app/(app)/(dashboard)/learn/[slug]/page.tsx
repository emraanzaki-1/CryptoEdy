import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { CryptoSchoolClient } from '@/components/learn/crypto-school-client'
import { mapPostToCardProps } from '@/lib/posts/mapToCardProps'
import { getBookmarkedPostIds } from '@/lib/bookmarks/getBookmarkedPostIds'
import { auth } from '@/lib/auth'
import { CRYPTO_SCHOOL_CATEGORIES } from '@/lib/constants/taxonomy'

export default async function CryptoSchoolCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  // Validate the slug is a valid Crypto School sub-category
  const validSlugs = CRYPTO_SCHOOL_CATEGORIES.map((c) => c.slug)
  if (!validSlugs.includes(slug as (typeof validSlugs)[number])) {
    notFound()
  }

  const payload = await getPayload({ config: configPromise })

  // Find the category by slug
  const { docs: categoryDocs } = await payload.find({
    collection: 'categories',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const category = categoryDocs[0]
  if (!category) notFound()

  const session = await auth()
  const bookmarkedIds = session?.user?.id
    ? await getBookmarkedPostIds(session.user.id)
    : new Set<string>()

  const { docs } = await payload.find({
    collection: 'posts',
    where: {
      status: { equals: 'published' },
      category: { equals: category.id },
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

  const filters = CRYPTO_SCHOOL_CATEGORIES.map((c) => ({
    label: c.label,
    slug: c.slug,
  }))

  const activeFilter = CRYPTO_SCHOOL_CATEGORIES.find((c) => c.slug === slug)?.label ?? 'All'

  return <CryptoSchoolClient articles={articles} filters={filters} activeFilter={activeFilter} />
}
