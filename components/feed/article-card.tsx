'use client'

import Link from 'next/link'
import { Clock, Lock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { BookmarkButton } from '@/components/feed/bookmark-button'
import { cn } from '@/lib/utils'
import { CategoryPill } from '@/components/feed/category-pill'

export interface ArticleCardProps {
  title: string
  excerpt: string
  category: string
  parentCategory?: string
  readTime: string
  date: string
  imageUrl: string
  imageAlt: string
  isPro?: boolean
  slug: string
  postId?: string
  isBookmarked?: boolean
  hero?: boolean
}

export function ArticleCard({
  title,
  excerpt,
  category,
  readTime,
  date,
  imageUrl,
  imageAlt,
  isPro,
  slug,
  postId,
  isBookmarked = false,
  hero = false,
}: ArticleCardProps) {
  return (
    <Link href={`/articles/${slug}`} className="flex h-full">
      <article
        className={cn(
          'group border-outline-variant/[0.03] bg-surface-container-lowest relative flex w-full cursor-pointer flex-col overflow-hidden rounded-2xl border',
          hero && 'md:flex-row'
        )}
      >
        {/* Image */}
        <div
          className={cn(
            'bg-surface-container relative overflow-hidden',
            hero ? 'aspect-[16/9] md:aspect-auto md:w-1/2 md:flex-shrink-0' : 'aspect-[16/10]'
          )}
        >
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            role="img"
            aria-label={imageAlt}
            style={{ backgroundImage: `url('${imageUrl}')` }}
          />

          {/* Gradient overlay for locked articles */}
          {isPro && (
            <div className="from-on-surface/40 absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t to-transparent" />
          )}

          {/* Badges row */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            {isPro && (
              <Badge variant="pro" className="shadow-sm">
                PRO
              </Badge>
            )}
            {isPro && (
              <span className="text-overline bg-on-surface/50 text-on-primary flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold backdrop-blur-sm">
                <Lock className="size-2.5" />
                Members only
              </span>
            )}
          </div>

          {/* Bookmark on hover */}
          {postId && (
            <BookmarkButton postId={postId} initialBookmarked={isBookmarked} variant="card" />
          )}
        </div>

        {/* Content */}
        <div className={cn('flex flex-1 flex-col gap-3 p-6', hero && 'md:justify-center md:p-8')}>
          {/* Title first */}
          <h3
            className={cn(
              'text-on-surface group-hover:text-primary leading-snug font-bold transition-colors',
              hero ? 'text-headline' : 'text-subtitle'
            )}
          >
            {title}
          </h3>

          <p
            className={cn(
              'text-on-surface-variant leading-relaxed',
              hero ? 'text-body-lg line-clamp-3' : 'text-body-sm line-clamp-2'
            )}
          >
            {excerpt}
          </p>

          {/* Metadata pinned to bottom */}
          <div className="mt-auto flex items-center justify-between gap-2 pt-2">
            <div className="flex items-center gap-2">
              <CategoryPill category={category} />
              <span className="text-outline text-xs">{date}</span>
            </div>
            <span className="text-outline flex shrink-0 items-center gap-1 text-xs">
              <Clock className="size-3.5" />
              {readTime}
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
