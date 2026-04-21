import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { CryptoSchoolClient } from '@/components/learn/crypto-school-client'
import { mapPostToCardProps } from '@/lib/posts/mapToCardProps'
import { getBookmarkedPostIds } from '@/lib/bookmarks/getBookmarkedPostIds'
import { auth } from '@/lib/auth'

export default async function CryptoSchoolCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const payload = await getPayload({ config: configPromise })

  // Verify the slug is a real sub-category of Crypto School (no hardcoded whitelist)
  const { docs: cryptoSchoolDocs } = await payload.find({
    collection: 'categories',
    where: { slug: { equals: 'crypto-school' } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const cryptoSchool = cryptoSchoolDocs[0]
  if (!cryptoSchool) notFound()

  // Fetch all sub-categories for filter pills
  const { docs: subCategories } = await payload.find({
    collection: 'categories',
    where: { parent: { equals: cryptoSchool.id } },
    sort: 'weight',
    limit: 50,
    depth: 0,
    overrideAccess: true,
  })

  const category = subCategories.find(
    (c) => (c as unknown as { slug: string }).slug === slug
  ) as unknown as { id: string | number; name: string; slug: string } | undefined
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

  const filters = subCategories.map((c) => ({
    label: (c as unknown as { name: string }).name,
    slug: (c as unknown as { slug: string }).slug,
  }))

  return <CryptoSchoolClient articles={articles} filters={filters} activeFilter={category.name} />
}
