'use client'

import Link from 'next/link'
import Image from 'next/image'
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
  layout?: 'card' | 'list'
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
  layout = 'card',
}: ArticleCardProps) {
  const isList = layout === 'list'

  return (
    <Link href={`/articles/${slug}`} className={cn('flex', !isList && 'h-full', isList && 'block')}>
      <article
        className={cn(
          'group border-outline-variant/[0.03] bg-surface-container-lowest relative flex w-full cursor-pointer overflow-hidden rounded-2xl border',
          isList ? 'flex-col sm:flex-row' : 'flex-col',
          hero && !isList && 'md:flex-row'
        )}
      >
        {/* Image */}
        <div
          className={cn(
            'bg-surface-container relative overflow-hidden',
            isList
              ? 'aspect-[16/10] sm:aspect-auto sm:w-56 sm:shrink-0 md:w-64'
              : hero
                ? 'aspect-[16/9] md:aspect-auto md:w-1/2 md:flex-shrink-0'
                : 'aspect-[16/10]'
          )}
        >
          <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105">
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              sizes={
                isList
                  ? '(max-width: 640px) 224px, 256px'
                  : hero
                    ? '(max-width: 768px) 100vw, 50vw'
                    : '(max-width: 768px) 100vw, 33vw'
              }
              className="object-cover object-center"
            />
          </div>

          {/* Gradient overlay for locked articles */}
          {isPro && !isList && (
            <div className="from-on-surface/40 absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t to-transparent" />
          )}

          {/* Badges row */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            {isPro && (
              <Badge variant="pro" className="shadow-sm">
                PRO
              </Badge>
            )}
            {isPro && !isList && (
              <span className="text-overline bg-on-surface/50 text-on-primary flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold backdrop-blur-sm">
                <Lock className="size-2.5" />
                Members only
              </span>
            )}
          </div>

          {/* Lock indicator for list layout */}
          {isPro && isList && (
            <div className="text-overline bg-on-surface/50 text-on-primary absolute bottom-3 left-3 flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold backdrop-blur-sm">
              <Lock className="size-2.5" />
              Members only
            </div>
          )}

          {/* Bookmark on hover */}
          {postId && (
            <BookmarkButton postId={postId} initialBookmarked={isBookmarked} variant="card" />
          )}
        </div>

        {/* Content */}
        <div
          className={cn(
            'flex flex-1 flex-col gap-3 p-6',
            isList && 'justify-center',
            hero && !isList && 'md:justify-center md:p-8'
          )}
        >
          <h3
            className={cn(
              'text-on-surface group-hover:text-primary font-bold transition-colors',
              hero && !isList ? 'text-headline' : 'text-subtitle'
            )}
          >
            {title}
          </h3>

          <p
            className={cn(
              'text-on-surface-variant',
              hero && !isList ? 'text-body-lg line-clamp-3' : 'text-body-sm line-clamp-2'
            )}
          >
            {excerpt}
          </p>

          {/* Metadata */}
          <div
            className={cn(
              'flex items-center justify-between gap-2',
              !isList && 'mt-auto pt-2',
              isList && 'mt-1'
            )}
          >
            <div className="flex items-center gap-2">
              <CategoryPill category={category} />
              <span className="text-outline text-label">{date}</span>
            </div>
            <span className="text-outline text-label flex shrink-0 items-center gap-1">
              <Clock className="size-3.5" />
              {readTime}
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
