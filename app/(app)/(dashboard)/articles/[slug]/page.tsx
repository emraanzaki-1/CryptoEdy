import { Clock } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { SerializedEditorState } from 'lexical'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Badge } from '@/components/ui/badge'
import { BookmarkButton } from '@/components/feed/bookmark-button'
import { ShareButton } from '@/components/article/share-button'
import { PaywallGate } from '@/components/article/paywall-gate'
import { auth } from '@/lib/auth'
import { getBookmarkedPostIds } from '@/lib/bookmarks/getBookmarkedPostIds'
import type { Role } from '@/lib/auth/withRole'
import { jsxConverters } from '@/lib/lexical/jsxConverters'
import { ArticleFAQ } from '@/components/article/article-faq'
import { RecommendedArticles } from '@/components/article/recommended-articles'
import { mapPostToCardProps } from '@/lib/posts/mapToCardProps'

// ── Helpers ──────────────────────────────────────────────────────────────────

const ROLE_HIERARCHY: Record<Role, number> = {
  guest: 0,
  free: 1,
  pro: 2,
  analyst: 3,
  admin: 4,
}

function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  // Fetch post from CMS
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'posts',
    where: {
      slug: { equals: slug },
      status: { equals: 'published' },
    },
    depth: 2,
    limit: 1,
    overrideAccess: true,
  })

  const post = docs[0]
  if (!post) notFound()

  // Resolve user role
  const session = await auth()
  const userRole = (session?.user?.role as Role) ?? 'free'
  const subscriptionExpiry = (session?.user as { subscriptionExpiry?: string | null } | undefined)
    ?.subscriptionExpiry
  const isProExpired =
    userRole === 'pro' && subscriptionExpiry && new Date(subscriptionExpiry) < new Date()
  const effectiveRole: Role = isProExpired ? 'free' : userRole

  // Determine lock state
  const isLocked = post.isProOnly === true && ROLE_HIERARCHY[effectiveRole] < ROLE_HIERARCHY['pro']

  // Fetch recommended articles (same category, excluding current post)
  const categoryId =
    post.category && typeof post.category === 'object' ? (post.category as { id: number }).id : null
  const recommendedResult = await payload.find({
    collection: 'posts',
    where: {
      status: { equals: 'published' },
      id: { not_equals: post.id },
      ...(categoryId ? { category: { equals: categoryId } } : {}),
    },
    sort: '-publishedAt',
    depth: 2,
    limit: 10,
    overrideAccess: true,
  })

  // Check bookmark state
  const bookmarkedIds = session?.user?.id
    ? await getBookmarkedPostIds(session.user.id)
    : new Set<string>()
  const isBookmarked = bookmarkedIds.has(String(post.id))

  // Extract data
  const author =
    post.author && typeof post.author === 'object' && 'displayName' in post.author
      ? ((post.author.displayName as string) ?? 'CryptoEdy Research')
      : 'CryptoEdy Research'

  const featuredImage =
    post.featuredImage && typeof post.featuredImage === 'object' && 'url' in post.featuredImage
      ? (post.featuredImage.url as string)
      : null

  const featuredImageAlt =
    post.featuredImage && typeof post.featuredImage === 'object' && 'alt' in post.featuredImage
      ? ((post.featuredImage.alt as string) ?? 'Article image')
      : 'Article image'

  // Resolve category names from populated relationship
  const categoryObj =
    post.category && typeof post.category === 'object'
      ? (post.category as Record<string, unknown>)
      : null
  const categoryName = (categoryObj?.name as string) ?? 'Research'
  const categorySlug = (categoryObj?.slug as string) ?? ''
  const parentObj =
    categoryObj?.parent && typeof categoryObj.parent === 'object'
      ? (categoryObj.parent as Record<string, unknown>)
      : null
  const parentName = (parentObj?.name as string) ?? categoryName
  const parentSlug = (parentObj?.slug as string) ?? categorySlug

  // Resolve tags from populated relationship
  const tags = Array.isArray(post.tags)
    ? post.tags
        .filter((t) => t && typeof t === 'object' && 'name' in t)
        .map((t) => {
          const tag = t as Record<string, unknown>
          return { name: tag.name as string, slug: (tag.slug as string) ?? '' }
        })
    : []

  return (
    <article className="mx-auto max-w-4xl">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: 'Home', href: '/feed' },
          { label: parentName, href: `/feed/${parentSlug}` },
          { label: categoryName, href: `/feed/${categorySlug}` },
          { label: post.title as string },
        ]}
        className="mb-8"
      />

      {/* Header */}
      <header className="mb-10">
        <div className="mb-6 flex items-center gap-3">
          {post.isProOnly && <Badge variant="pro">PRO</Badge>}
          <span className="text-primary text-sm font-semibold tracking-[0.05em] uppercase">
            {categoryName}
          </span>
        </div>

        <h1 className="text-on-background text-headline-md md:text-headline-lg mb-6 font-black">
          {post.title as string}
        </h1>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="border-outline-variant/15 bg-surface-container-high text-primary flex size-12 items-center justify-center rounded-full border font-bold">
              CE
            </div>
            <div>
              <div className="text-on-background font-bold">{author}</div>
              <div className="text-outline mt-1 flex items-center gap-3 text-sm">
                <span>
                  {post.publishedAt ? formatDate(post.publishedAt as string) : 'Unpublished'}
                </span>
                <span className="bg-outline-variant size-1 rounded-full" />
                <span className="flex items-center gap-1">
                  <Clock className="size-4" />
                  {post.readTime ?? 5} min read
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ShareButton title={post.title as string} slug={(post.slug as string) ?? slug} />
            <BookmarkButton
              postId={String(post.id)}
              initialBookmarked={isBookmarked}
              variant="article"
            />
          </div>
        </div>
      </header>

      {/* Hero Image */}
      {featuredImage && (
        <div className="border-outline-variant/15 relative mb-10 h-[400px] w-full overflow-hidden rounded-2xl border shadow-[0_32px_64px_-12px_rgba(11,28,48,0.06)]">
          <Image
            alt={featuredImageAlt}
            className="object-cover"
            src={featuredImage}
            fill
            sizes="(max-width: 896px) 100vw, 896px"
          />
        </div>
      )}

      {/* The Hook */}
      {post.excerpt && (
        <p className="border-primary text-on-background mb-10 border-l-4 py-2 pl-6 text-xl leading-relaxed font-medium md:text-2xl">
          {post.excerpt as string}
        </p>
      )}

      {/* Content */}
      {isLocked ? (
        <section className="article-body text-on-surface-variant max-w-none text-base leading-[1.6]">
          <PaywallGate isAuthenticated={!!session?.user} />
        </section>
      ) : (
        <section className="article-body text-on-surface-variant max-w-none text-base leading-[1.6]">
          <RichText data={post.content as SerializedEditorState} converters={jsxConverters} />
        </section>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <footer className="border-outline-variant/15 mt-10 border-t pt-6">
          <div className="flex flex-wrap items-center gap-2">
            {tags.map((tag) => (
              <Link
                key={tag.slug}
                href={`/tag/${tag.slug}`}
                className="text-primary hover:bg-primary/10 rounded-full px-3 py-1 text-sm font-medium transition-colors"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        </footer>
      )}
      {/* Recommended Articles */}
      <RecommendedArticles
        articles={recommendedResult.docs.map((p) =>
          mapPostToCardProps(p as Record<string, unknown>, {
            isBookmarked: bookmarkedIds.has(String(p.id)),
          })
        )}
      />

      {/* FAQ */}
      <ArticleFAQ />
    </article>
  )
}
