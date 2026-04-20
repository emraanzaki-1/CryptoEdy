import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { CryptoSchoolClient } from '@/components/learn/crypto-school-client'
import { mapPostToCardProps } from '@/lib/posts/mapToCardProps'
import { getBookmarkedPostIds } from '@/lib/bookmarks/getBookmarkedPostIds'
import { auth } from '@/lib/auth'
import { CRYPTO_SCHOOL_CATEGORIES } from '@/lib/constants/taxonomy'

export default async function LearnPage() {
  const payload = await getPayload({ config: configPromise })

  // Find the Crypto School category and its children (grandchildren in the hierarchy)
  const { docs: cryptoSchoolDocs } = await payload.find({
    collection: 'categories',
    where: { slug: { equals: 'crypto-school' } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const cryptoSchool = cryptoSchoolDocs[0]

  let articles: ReturnType<typeof mapPostToCardProps>[] = []

  if (cryptoSchool) {
    // Get all grandchild category IDs
    const { docs: grandchildren } = await payload.find({
      collection: 'categories',
      where: { parent: { equals: cryptoSchool.id } },
      limit: 50,
      depth: 0,
      overrideAccess: true,
    })

    const categoryIds = [cryptoSchool.id, ...grandchildren.map((c) => c.id)]

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

    articles = docs.map((post) =>
      mapPostToCardProps(post as unknown as Record<string, unknown>, {
        isBookmarked: bookmarkedIds.has(String(post.id)),
      })
    )
  }

  const filters = CRYPTO_SCHOOL_CATEGORIES.map((c) => ({
    label: c.label,
    slug: c.slug,
  }))

  return <CryptoSchoolClient articles={articles} filters={filters} />
}
