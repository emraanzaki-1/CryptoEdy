import Link from 'next/link'
import Image from 'next/image'
import { Lock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Heading } from '@/components/ui/typography'
import { LAYOUT } from '@/lib/config/layout'
import { getPayload } from 'payload'
import config from '@payload-config'
import { timeAgo } from '@/lib/utils/timeAgo'

interface ArticlePreview {
  title: string
  excerpt: string
  category: string
  date: string
  imageUrl: string
  imageAlt: string
  isPro: boolean
  slug: string
}

const FALLBACK_ARTICLES: ArticlePreview[] = [
  {
    title: 'Bitcoin Post-Halving Outlook',
    excerpt:
      'Analyzing the historical impact of halvings on BTC price action and adjusting expectations for the current liquidity cycle.',
    category: 'Macro',
    date: 'Oct 24',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDqqJh5KXK47FPDUA-An4eQIgvreMU0QdlPfO3_VkR1XZRXfqD8Elt3EG3NqnLL_J_yJUOuK-uJzjtBYs-nTaha-k5GpBXzsVGMDB5fldMZmzozK3KVwuQWXGkY7PgWXfmx6ydffItzTEAxI_AoOcvx1DrfndGxGVzef1Ka-e92PjmYIeOStYAhQ2RvbaOwN6-PaWRzbpYr6ttwcgOhm8aNNtlA6FH3XJeLqdeb7Ka-Nze92XCDcfxFNW4XvY_RyiEAwK7fLKZAxJJ0',
    imageAlt: 'Bitcoin Post-Halving Outlook',
    isPro: false,
    slug: '#',
  },
  {
    title: 'Solana Ecosystem: The Next Wave',
    excerpt:
      'Unlocking the next wave of DeFi innovation on Solana requires identifying key protocols with strong revenue generation and low token inflation.',
    category: 'Deep Dive',
    date: 'Oct 22',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCZ27KM3aCCmPuQcRXWCdCoNwtfUjl4Gk6EW4kFlqweBmT36hZHNNuJQ3HlfhhZSJJJr3GLtYqnDD_3UynS8MU0l8g7_UItZckqa42QfJLlYGTnSs2zRxgp3Zpndd2W6q1wx4bqEi1dtGQmxs80WfPxrtCL2cQ6Rb0DBYbAKmT9BxWNCtayXpP2CC559WgtahGH9TTblsz4HWHHW16rP_dPRbFkKYLNamPq4XeAvf8DqwagwzPw4TTF6hkGqd7HOiRy5M29YXwSBfh_',
    imageAlt: 'Solana Ecosystem: The Next Wave',
    isPro: true,
    slug: '#',
  },
  {
    title: 'Q4 Macroeconomic Update',
    excerpt:
      'Navigating the shifting global liquidity landscape and what central bank policy means for risk assets through year-end.',
    category: 'Quarterly',
    date: 'Oct 15',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC2Lz0Ea4oX2K3GWr5f7v4FmlPL7C2IgSNU-xstBAM3Sv07FRmPxE9skqwOMTQiTOPif86ih3Gdjv57LiQRb0xPKXbK7prVq3esjiKX3XBs6A7bu01a2TI87M6aEVxtwiIXiSkv6yW7ntkmcBTUAIGoCW7VxgENnWhdvGhScaMVWAhrHI9yDZUxOxOSgwkySMqAoRUJ1BiGM9sgFOyz4MReD4QWZojmRfHW8jYCjZ9zpwyaPR0rUZj_-RhvxwUlFR3fN6zCmgbaZbMO',
    imageAlt: 'Q4 Macroeconomic Update',
    isPro: false,
    slug: '#',
  },
]

function mapPostToPreview(post: Record<string, unknown>): ArticlePreview {
  const featuredImage =
    post.featuredImage && typeof post.featuredImage === 'object'
      ? (post.featuredImage as Record<string, unknown>)
      : null

  const categoryObj =
    post.category && typeof post.category === 'object'
      ? (post.category as Record<string, unknown>)
      : null

  return {
    title: post.title as string,
    excerpt: (post.excerpt as string) ?? '',
    category: (categoryObj?.name as string) ?? 'Research',
    date: post.publishedAt ? timeAgo(post.publishedAt as string) : '',
    imageUrl: (featuredImage?.url as string) ?? '',
    imageAlt: (featuredImage?.alt as string) ?? (post.title as string),
    isPro: post.isProOnly === true,
    slug: (post.slug as string) ?? String(post.id),
  }
}

export async function ResearchPreviewSection() {
  let articles: ArticlePreview[] = FALLBACK_ARTICLES

  try {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'posts',
      where: { status: { equals: 'published' } },
      sort: '-publishedAt',
      depth: 2,
      limit: 3,
      overrideAccess: true,
    })

    if (docs.length > 0) {
      articles = docs.map((doc) => mapPostToPreview(doc as unknown as Record<string, unknown>))
    }
  } catch {
    // Fall back to hardcoded articles
  }

  return (
    <section className="flex flex-col gap-8" id="research">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <span className="text-primary text-overline font-bold uppercase">
          Free &amp; Pro &middot; Research
        </span>
        <div className="flex items-baseline justify-between">
          <Heading responsive className="font-black">
            Latest research.
          </Heading>
          <Link
            href="/feed"
            className="text-primary text-body-sm font-semibold underline-offset-4 hover:underline"
          >
            View All Archive
          </Link>
        </div>
      </div>

      {/* Cards */}
      <div className={`grid grid-cols-1 md:grid-cols-3 [&>*]:h-full ${LAYOUT.spacing.gridGap}`}>
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={article.slug === '#' ? '#' : `/articles/${article.slug}`}
            className="border-outline-variant/[0.08] group hover:shadow-ambient-hover flex cursor-pointer flex-col overflow-hidden rounded-2xl border transition-all duration-200"
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden">
              {article.imageUrl ? (
                <Image
                  src={article.imageUrl}
                  alt={article.imageAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="bg-surface-container-high size-full" />
              )}
              <div className="bg-on-surface absolute inset-0 opacity-0 transition-opacity group-hover:opacity-10" />
              {article.isPro && (
                <div className="bg-tertiary-fixed text-on-tertiary-fixed-variant text-overline absolute top-3 right-3 flex items-center gap-1 rounded-full px-3 py-1 font-bold uppercase shadow-sm">
                  <Lock className="size-3.5" /> PRO
                </div>
              )}
            </div>
            <div className={`flex flex-1 flex-col gap-2 ${LAYOUT.spacing.card}`}>
              <div className="flex items-center gap-2">
                <Badge variant="category">{article.category}</Badge>
                <span className="text-on-surface-variant text-micro">{article.date}</span>
              </div>
              <p className="text-on-surface group-hover:text-primary text-body-lg leading-snug font-bold transition-colors">
                {article.title}
              </p>
              {article.isPro ? (
                <div className="relative">
                  <p className="text-on-surface-variant text-body-sm blur-[3px] select-none">
                    {article.excerpt}
                  </p>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-surface-container-lowest/90 text-primary text-overline rounded px-3 py-1 font-bold uppercase backdrop-blur-sm">
                      Unlock to Read
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-on-surface-variant text-body-sm line-clamp-2">
                  {article.excerpt}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
