'use client'

import Link from 'next/link'
import { FilterChip } from '@/components/ui/filter-chip'
import { ViewToggle } from '@/components/feed/view-toggle'
import { ArticleCard } from '@/components/feed/article-card'
import { ArticleCardList } from '@/components/feed/article-card-list'
import {
  ArticleCardSkeleton,
  ArticleCardListSkeleton,
} from '@/components/feed/article-card-skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { SectionHeader } from '@/components/common/section-header'
import { useInfiniteScroll } from '@/lib/hooks/useInfiniteScroll'
import { useViewPreference } from '@/lib/hooks/useViewPreference'
import type { ArticleCardProps } from '@/components/feed/article-card'

interface FeedClientProps {
  articles: ArticleCardProps[]
  filters?: { label: string; slug: string }[]
  activeFilter?: string
  initialHasNextPage?: boolean
  categorySlug?: string
}

export function FeedClient({
  articles: initialArticles,
  filters = [],
  activeFilter = 'All',
  initialHasNextPage = false,
  categorySlug,
}: FeedClientProps) {
  const [view, setView] = useViewPreference()

  const fetchUrl = categorySlug
    ? `/api/posts?category=${encodeURIComponent(categorySlug)}&limit=12`
    : '/api/posts?limit=12'

  const { articles, isLoading, hasNextPage, sentinelRef } = useInfiniteScroll({
    initialArticles,
    initialHasNextPage,
    fetchUrl,
  })

  return (
    <div className="mx-auto flex w-full flex-col gap-8">
      {/* Header */}
      <SectionHeader
        title="Your feed"
        subtitle="Curated financial intelligence and market analysis."
        action={<ViewToggle view={view} onViewChange={setView} />}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Link href="/feed">
          <FilterChip label="All" active={activeFilter === 'All'} />
        </Link>
        {filters.map((filter) => (
          <Link key={filter.slug} href={`/feed/${filter.slug}`}>
            <FilterChip label={filter.label} active={activeFilter === filter.label} />
          </Link>
        ))}
      </div>

      {/* Feed */}
      {articles.length > 0 ? (
        view === 'grid' ? (
          <div className="flex flex-col gap-6">
            {articles[0] && <ArticleCard {...articles[0]} hero />}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 [&>*]:h-full">
              {articles.slice(1).map((article) => (
                <ArticleCard key={article.slug} {...article} />
              ))}
            </div>

            {/* Loading skeletons */}
            {isLoading && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <ArticleCardSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Sentinel for infinite scroll */}
            {hasNextPage && <div ref={sentinelRef} className="h-1" />}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {articles.map((article) => (
              <ArticleCardList key={article.slug} {...article} />
            ))}

            {/* Loading skeletons */}
            {isLoading &&
              Array.from({ length: 3 }).map((_, i) => <ArticleCardListSkeleton key={i} />)}

            {/* Sentinel for infinite scroll */}
            {hasNextPage && <div ref={sentinelRef} className="h-1" />}
          </div>
        )
      ) : activeFilter === 'All' ? (
        <EmptyState
          title="No articles yet"
          message="New research and analysis will appear here as they're published."
        />
      ) : (
        <EmptyState
          title="No results"
          message={`No articles match the "${activeFilter}" filter. Try a different category or browse all articles.`}
        />
      )}
    </div>
  )
}
