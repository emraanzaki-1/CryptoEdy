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
  let articles: ArticlePreview[] = []

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

    articles = docs.map((doc) => mapPostToPreview(doc as unknown as Record<string, unknown>))
  } catch {
    return null
  }

  if (articles.length === 0) return null

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
            href="/research"
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
