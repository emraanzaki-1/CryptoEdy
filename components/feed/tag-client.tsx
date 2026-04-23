'use client'

import { ViewToggle } from '@/components/feed/view-toggle'
import { ArticleCard } from '@/components/feed/article-card'
import {
  ArticleCardSkeleton,
  ArticleCardListSkeleton,
} from '@/components/feed/article-card-skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { useInfiniteScroll } from '@/lib/hooks/useInfiniteScroll'
import { useViewPreference } from '@/lib/hooks/useViewPreference'
import type { ArticleCardProps } from '@/components/feed/article-card'

interface TagClientProps {
  tagName: string
  articles: ArticleCardProps[]
  subtitle?: string
  emptyTitle?: string
  emptyMessage?: string
  initialHasNextPage?: boolean
  fetchUrl?: string
  isAuthenticated?: boolean
}

export function TagClient({
  tagName,
  articles: initialArticles,
  subtitle,
  emptyTitle,
  emptyMessage,
  initialHasNextPage = false,
  fetchUrl = '/api/posts?limit=12',
  isAuthenticated = true,
}: TagClientProps) {
  const [view, setView] = useViewPreference()

  const { articles, isLoading, hasNextPage, sentinelRef } = useInfiniteScroll({
    initialArticles,
    initialHasNextPage,
    fetchUrl,
  })

  const defaultSubtitle = tagName
    ? `Articles tagged with #${tagName}`
    : `${initialArticles.length} ${initialArticles.length === 1 ? 'article' : 'articles'}`

  return (
    <>
      <div className="flex items-end justify-between">
        <p className="text-on-surface-variant text-body-lg">{subtitle ?? defaultSubtitle}</p>
        <ViewToggle view={view} onViewChange={setView} />
      </div>

      {articles.length > 0 ? (
        view === 'grid' ? (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 [&>*]:h-full">
              {articles.map((article) => (
                <ArticleCard
                  key={article.slug}
                  {...article}
                  isAuthenticated={isAuthenticated}
                  headingLevel="h2"
                />
              ))}
            </div>

            {isLoading && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <ArticleCardSkeleton key={i} />
                ))}
              </div>
            )}

            {hasNextPage && <div ref={sentinelRef} className="h-1" />}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {articles.map((article) => (
              <ArticleCard
                key={article.slug}
                {...article}
                layout="list"
                isAuthenticated={isAuthenticated}
                headingLevel="h2"
              />
            ))}

            {isLoading &&
              Array.from({ length: 3 }).map((_, i) => <ArticleCardListSkeleton key={i} />)}

            {hasNextPage && <div ref={sentinelRef} className="h-1" />}
          </div>
        )
      ) : (
        <EmptyState
          title={emptyTitle ?? 'No articles yet'}
          message={emptyMessage ?? `No articles have been tagged with #${tagName} yet.`}
        />
      )}
    </>
  )
}
