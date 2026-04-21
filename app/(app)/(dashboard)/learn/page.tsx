import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { CryptoSchoolClient } from '@/components/learn/crypto-school-client'
import { mapPostToCardProps } from '@/lib/posts/mapToCardProps'
import { getBookmarkedPostIds } from '@/lib/bookmarks/getBookmarkedPostIds'
import { auth } from '@/lib/auth'

export default async function LearnPage() {
  const payload = await getPayload({ config: configPromise })

  // Find the Crypto School category and its children dynamically
  const { docs: cryptoSchoolDocs } = await payload.find({
    collection: 'categories',
    where: { slug: { equals: 'crypto-school' } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const cryptoSchool = cryptoSchoolDocs[0]

  let articles: ReturnType<typeof mapPostToCardProps>[] = []
  let filters: { label: string; slug: string }[] = []

  if (cryptoSchool) {
    // Fetch sub-categories from Payload — no hardcoded list
    const { docs: subCategories } = await payload.find({
      collection: 'categories',
      where: { parent: { equals: cryptoSchool.id } },
      sort: 'weight',
      limit: 50,
      depth: 0,
      overrideAccess: true,
    })

    filters = subCategories.map((c) => ({
      label: (c as unknown as { name: string }).name,
      slug: (c as unknown as { slug: string }).slug,
    }))

    const categoryIds = [cryptoSchool.id, ...subCategories.map((c) => c.id)]

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

  return <CryptoSchoolClient articles={articles} filters={filters} />
}
