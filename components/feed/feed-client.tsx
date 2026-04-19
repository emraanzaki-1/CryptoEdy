'use client'

import { useState } from 'react'
import { FilterChip } from '@/components/ui/filter-chip'
import { ViewToggle } from '@/components/feed/view-toggle'
import { ArticleCard } from '@/components/feed/article-card'
import { ArticleCardList } from '@/components/feed/article-card-list'
import { EmptyState } from '@/components/common/empty-state'
import type { ArticleCardProps } from '@/components/feed/article-card'

const FILTERS = ['All', 'Research', 'Analysis', 'News'] as const

export function FeedClient({ articles }: { articles: ArticleCardProps[] }) {
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [activeFilter, setActiveFilter] = useState('All')

  const filtered =
    activeFilter === 'All'
      ? articles
      : articles.filter((a) => a.category.toLowerCase().includes(activeFilter.toLowerCase()))

  return (
    <div className="mx-auto flex w-full flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-on-surface text-2xl leading-tight font-bold tracking-[-0.04em] lg:text-3xl">
            Your feed
          </h1>
          <p className="text-on-surface-variant mt-2 text-base">
            Curated financial intelligence and market analysis.
          </p>
        </div>
        <ViewToggle view={view} onViewChange={setView} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {FILTERS.map((filter) => (
          <FilterChip
            key={filter}
            label={filter}
            active={activeFilter === filter}
            onClick={() => setActiveFilter(filter)}
          />
        ))}
      </div>

      {/* Feed */}
      {filtered.length > 0 ? (
        view === 'grid' ? (
          <div className="flex flex-col gap-6">
            {filtered[0] && <ArticleCard {...filtered[0]} hero />}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 [&>*]:h-full">
              {filtered.slice(1).map((article) => (
                <ArticleCard key={article.slug} {...article} />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((article) => (
              <ArticleCardList key={article.slug} {...article} />
            ))}
          </div>
        )
      ) : articles.length === 0 ? (
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
