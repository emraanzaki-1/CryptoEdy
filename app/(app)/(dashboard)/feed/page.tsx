import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { FeedClient } from '@/components/feed/feed-client'
import type { ArticleCardProps } from '@/components/feed/article-card'

function timeAgo(date: string | Date): string {
  const now = Date.now()
  const then = new Date(date).getTime()
  const diffMs = now - then
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 14) return '1 week ago'
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default async function FeedPage() {
  const payload = await getPayload({ config: configPromise })

  const { docs } = await payload.find({
    collection: 'posts',
    where: {
      status: { equals: 'published' },
    },
    sort: '-publishedAt',
    depth: 2,
    limit: 20,
    overrideAccess: true,
  })

  const articles: ArticleCardProps[] = docs.map((post) => {
    const featuredImage =
      post.featuredImage && typeof post.featuredImage === 'object' && 'url' in post.featuredImage
        ? (post.featuredImage.url as string)
        : ''

    const featuredImageAlt =
      post.featuredImage && typeof post.featuredImage === 'object' && 'alt' in post.featuredImage
        ? ((post.featuredImage.alt as string) ?? 'Article image')
        : 'Article image'

    // Resolve category name from populated relationship
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

    return {
      title: post.title as string,
      excerpt: (post.excerpt as string) ?? '',
      category: categoryName,
      parentCategory: parentName,
      readTime: `${post.readTime ?? 5} min read`,
      date: post.publishedAt ? timeAgo(post.publishedAt as string) : 'Draft',
      imageUrl: featuredImage,
      imageAlt: featuredImageAlt,
      isPro: post.isProOnly === true,
      slug: (post.slug as string) ?? '',
    }
  })

  return <FeedClient articles={articles} />
}
