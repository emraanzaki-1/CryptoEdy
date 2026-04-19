import { Share, Bookmark, Clock } from 'lucide-react'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { SerializedEditorState } from 'lexical'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Badge } from '@/components/ui/badge'
import { PaywallGate } from '@/components/article/paywall-gate'
import { auth } from '@/lib/auth'
import type { Role } from '@/lib/auth/withRole'
import { jsxConverters } from '@/lib/lexical/jsxConverters'

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
  const parentObj =
    categoryObj?.parent && typeof categoryObj.parent === 'object'
      ? (categoryObj.parent as Record<string, unknown>)
      : null
  const parentName = (parentObj?.name as string) ?? categoryName

  return (
    <article className="mx-auto max-w-4xl">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: 'Home', href: '/feed' },
          { label: parentName, href: '/feed' },
          { label: categoryName, href: '/feed' },
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
            <button
              aria-label="Share"
              className="border-outline-variant/15 bg-surface text-on-surface-variant hover:bg-surface-container-low flex size-10 items-center justify-center rounded-full border transition-colors"
            >
              <Share className="size-5" />
            </button>
            <button
              aria-label="Bookmark"
              className="border-outline-variant/15 bg-surface text-on-surface-variant hover:bg-surface-container-low flex size-10 items-center justify-center rounded-full border transition-colors"
            >
              <Bookmark className="size-5" />
            </button>
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
    </article>
  )
}
