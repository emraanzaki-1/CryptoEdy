import { Clock } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { SerializedEditorState } from 'lexical'
import type { Metadata } from 'next'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Badge } from '@/components/ui/badge'
import { Heading } from '@/components/ui/typography'
import { BookmarkButton } from '@/components/feed/bookmark-button'
import { ShareButton } from '@/components/article/share-button'
import { PaywallGate } from '@/components/article/paywall-gate'
import { auth } from '@/lib/auth'
import { getBookmarkedPostIds } from '@/lib/bookmarks/getBookmarkedPostIds'
import type { Role } from '@/lib/auth/withRole'
import { jsxConverters } from '@/lib/lexical/jsxConverters'
import { truncateEditorState } from '@/lib/lexical/truncateEditorState'
import { ArticleFAQ } from '@/components/article/article-faq'
import { RecommendedArticles } from '@/components/article/recommended-articles'
import { mapPostToCardProps } from '@/lib/posts/mapToCardProps'

// ── Metadata ─────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'posts',
    where: { slug: { equals: slug }, status: { equals: 'published' } },
    depth: 1,
    limit: 1,
    overrideAccess: true,
  })
  const post = docs[0]
  if (!post) return {}

  const title = `${post.title as string} | CryptoEdy`
  const description = (post.excerpt as string) ?? undefined
  const coverImage =
    post.coverImage && typeof post.coverImage === 'object'
      ? (post.coverImage as { url?: string }).url
      : undefined
  const featuredImage =
    post.featuredImage && typeof post.featuredImage === 'object'
      ? (post.featuredImage as { url?: string }).url
      : undefined
  const ogImage = featuredImage ?? coverImage
  const canonicalUrl = `${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/articles/${slug}`
  const author =
    post.author && typeof post.author === 'object' && 'displayName' in post.author
      ? ((post.author as { displayName?: string }).displayName ?? 'CryptoEdy Research')
      : 'CryptoEdy Research'

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: post.title as string,
      description,
      type: 'article',
      publishedTime: post.publishedAt as string | undefined,
      authors: [author],
      ...(ogImage
        ? { images: [{ url: ogImage, width: 1200, height: 630, alt: post.title as string }] }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title as string,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  }
}

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

export default async function ArticleDetailPage({ params }: PageProps) {
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
  const isAuthenticated = !!session?.user
  const userRole = (session?.user?.role as Role) ?? 'guest'
  const subscriptionExpiry = (session?.user as { subscriptionExpiry?: string | null } | undefined)
    ?.subscriptionExpiry
  const isProExpired =
    userRole === 'pro' && subscriptionExpiry && new Date(subscriptionExpiry) < new Date()
  const effectiveRole: Role = isProExpired ? 'free' : userRole

  // Derive a single access state
  type AccessState = 'guest-gated' | 'pro-locked' | 'partial-preview' | 'full-access'
  const accessState: AccessState = (() => {
    if (!isAuthenticated) return 'guest-gated'
    if (post.isProOnly === true && ROLE_HIERARCHY[effectiveRole] < ROLE_HIERARCHY['pro'])
      return 'pro-locked'
    if (ROLE_HIERARCHY[effectiveRole] < ROLE_HIERARCHY['pro']) return 'partial-preview'
    return 'full-access'
  })()

  // Truncate content for partial preview
  const truncatedContent =
    accessState === 'partial-preview'
      ? truncateEditorState(post.content as SerializedEditorState)
      : null
  // If truncation returns null (article too short), show full content
  const effectiveAccess: AccessState =
    accessState === 'partial-preview' && !truncatedContent ? 'full-access' : accessState

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

  // Resolve breadcrumb hub path from parent category
  const hubPathMap: Record<string, string> = {
    research: '/research',
    analysis: '/analysis',
    education: '/learn',
  }
  const hubPath = hubPathMap[parentSlug] ?? '/feed'

  const siteUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title as string,
    description: post.excerpt as string | undefined,
    image: featuredImage ?? undefined,
    datePublished: post.publishedAt as string | undefined,
    author: { '@type': 'Person', name: author },
    publisher: {
      '@type': 'Organization',
      name: 'CryptoEdy',
      url: siteUrl,
    },
    url: `${siteUrl}/articles/${slug}`,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="mx-auto max-w-4xl">
        {/* Breadcrumbs — authenticated only */}
        {isAuthenticated && (
          <Breadcrumb
            items={[
              { label: 'Home', href: '/feed' },
              { label: parentName, href: hubPath },
              { label: categoryName, href: `${hubPath}/${categorySlug}` },
              { label: post.title as string },
            ]}
            className="mb-8"
          />
        )}

        {/* Header */}
        <header className="mb-10">
          <div className="mb-6 flex items-center gap-3">
            {post.isProOnly && <Badge variant="pro">PRO</Badge>}
            <span className="text-primary text-overline font-bold uppercase">{categoryName}</span>
          </div>

          <Heading
            as="h1"
            size="md"
            className="text-on-background md:text-headline-lg mb-6 font-black"
          >
            {post.title as string}
          </Heading>

          <div className="mb-6 flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="border-outline-variant/15 bg-surface-container-high text-primary flex size-12 items-center justify-center rounded-full border font-bold">
                CE
              </div>
              <div>
                <div className="text-on-background font-bold">{author}</div>
                <div className="text-outline text-body-sm mt-1 flex items-center gap-3">
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
              {isAuthenticated && (
                <BookmarkButton
                  postId={String(post.id)}
                  initialBookmarked={isBookmarked}
                  variant="article"
                />
              )}
            </div>
          </div>
        </header>

        {/* Hero Image */}
        {featuredImage && (
          <div className="border-outline-variant/15 shadow-elevated relative mb-10 h-[400px] w-full overflow-hidden rounded-2xl border">
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
          <p className="border-primary text-on-background md:text-subtitle text-title mb-10 border-l-4 py-2 pl-6 font-medium">
            {post.excerpt as string}
          </p>
        )}

        {/* Content */}
        {effectiveAccess === 'guest-gated' ? (
          <PaywallGate isAuthenticated={false} variant="guest" />
        ) : effectiveAccess === 'pro-locked' ? (
          <PaywallGate isAuthenticated={isAuthenticated} variant="pro" />
        ) : effectiveAccess === 'partial-preview' && truncatedContent ? (
          <>
            <section className="article-body text-on-surface-variant text-body-lg relative max-w-none">
              <RichText data={truncatedContent} converters={jsxConverters} />
              {/* Fade-out gradient inside the content container */}
              <div className="via-background/80 to-background pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent" />
            </section>
            <PaywallGate isAuthenticated={isAuthenticated} variant="pro" showPreview={false} />
          </>
        ) : (
          <section className="article-body text-on-surface-variant text-body-lg max-w-none">
            <RichText data={post.content as SerializedEditorState} converters={jsxConverters} />
          </section>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <footer className="mt-10 pt-6">
            <div className="flex flex-wrap items-center gap-2">
              {tags.map((tag) => (
                <Link
                  key={tag.slug}
                  href={`/tag/${tag.slug}`}
                  className="text-primary hover:bg-primary/10 text-body-sm rounded-full px-3 py-1 font-medium transition-colors"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          </footer>
        )}
      </article>

      {/* FAQ — not part of the article, constrained to article width */}
      <div className="mx-auto max-w-4xl">
        <ArticleFAQ />
      </div>

      {/* Recommended Articles — full width */}
      <RecommendedArticles
        articles={recommendedResult.docs.map((p) => ({
          ...mapPostToCardProps(p as Record<string, unknown>, {
            isBookmarked: bookmarkedIds.has(String(p.id)),
          }),
          isAuthenticated,
        }))}
      />
    </>
  )
}
