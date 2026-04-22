import type { ArticleCardProps } from '@/components/feed/article-card'
import { timeAgo } from '@/lib/utils/timeAgo'

export { timeAgo } from '@/lib/utils/timeAgo'

export function mapPostToCardProps(
  post: Record<string, unknown>,
  options?: { isBookmarked?: boolean; blurDataUrl?: string }
): ArticleCardProps {
  const featuredImage =
    post.featuredImage &&
    typeof post.featuredImage === 'object' &&
    'url' in (post.featuredImage as Record<string, unknown>)
      ? ((post.featuredImage as Record<string, unknown>).url as string)
      : ''

  const featuredImageAlt =
    post.featuredImage &&
    typeof post.featuredImage === 'object' &&
    'alt' in (post.featuredImage as Record<string, unknown>)
      ? (((post.featuredImage as Record<string, unknown>).alt as string) ?? 'Article image')
      : 'Article image'

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
    slug: typeof post.slug === 'string' ? post.slug : String(post.id),
    postId: String(post.id),
    isBookmarked: options?.isBookmarked ?? false,
    blurDataUrl: options?.blurDataUrl,
  }
}
