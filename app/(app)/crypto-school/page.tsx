import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { GuestShell } from '@/components/layouts/guest-shell'
import { getNavCategories } from '@/lib/categories/getCategories'
import { LAYOUT } from '@/lib/config/layout'
import { CryptoSchoolHero } from '@/components/education/crypto-school-hero'
import { CryptoSchoolCatalog } from '@/components/education/crypto-school-catalog'

export const metadata: Metadata = {
  title: 'Crypto School — CryptoEdy',
  description:
    'Master the fundamentals with CryptoEdy Crypto School. Blueprints, guides, videos, and simplified explainers for digital asset intelligence.',
}

interface PostPreview {
  id: string | number
  title: string
  excerpt: string
  isProOnly: boolean
}

interface CatalogCategory {
  name: string
  slug: string
  posts: PostPreview[]
}

async function getCryptoSchoolData(): Promise<CatalogCategory[]> {
  try {
    const payload = await getPayload({ config })

    // Find the 'crypto-school' category (child of Education)
    const { docs: csResults } = await payload.find({
      collection: 'categories',
      where: { slug: { equals: 'crypto-school' } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    const cryptoSchool = csResults[0]
    if (!cryptoSchool) return []

    // Find grandchild categories (children of crypto-school)
    const { docs: children } = await payload.find({
      collection: 'categories',
      where: { parent: { equals: cryptoSchool.id } },
      sort: 'weight',
      limit: 20,
      depth: 0,
      overrideAccess: true,
    })

    // For each child, fetch 2 recent published posts
    const categories: CatalogCategory[] = await Promise.all(
      children.map(async (child) => {
        const { docs: posts } = await payload.find({
          collection: 'posts',
          where: {
            status: { equals: 'published' },
            category: { equals: child.id },
          },
          sort: '-publishedAt',
          limit: 2,
          depth: 1,
          overrideAccess: true,
        })

        return {
          name: (child as unknown as { name: string }).name,
          slug: (child as unknown as { slug: string }).slug,
          posts: posts.map((post) => ({
            id: post.id,
            title: post.title,
            excerpt: post.excerpt ?? '',
            isProOnly: post.isProOnly ?? false,
          })),
        }
      })
    )

    return categories
  } catch {
    return []
  }
}

export default async function CryptoSchoolPage() {
  const [navCategories, catalogCategories] = await Promise.all([
    getNavCategories(),
    getCryptoSchoolData(),
  ])

  return (
    <GuestShell navCategories={navCategories}>
      <CryptoSchoolHero />

      <div className={`flex flex-1 justify-center ${LAYOUT.guest.px}`}>
        <div className="max-w-site flex flex-1 flex-col gap-16 py-16">
          <CryptoSchoolCatalog categories={catalogCategories} />
        </div>
      </div>
    </GuestShell>
  )
}
