'use client'

import Link from 'next/link'
import { FilterChip } from '@/components/ui/filter-chip'
import { ViewToggle } from '@/components/feed/view-toggle'
import { ArticleCard } from '@/components/feed/article-card'
import { EmptyState } from '@/components/common/empty-state'
import { SectionHeading } from '@/components/common/section-heading'
import { useViewPreference } from '@/lib/hooks/useViewPreference'
import type { ArticleCardProps } from '@/components/feed/article-card'

interface CategoryHubClientProps {
  articles: ArticleCardProps[]
  filters: { label: string; slug: string }[]
  activeFilter?: string
  title: string
  description?: string
  basePath: string
  isAuthenticated?: boolean
}

export function CategoryHubClient({
  articles,
  filters,
  activeFilter = 'All',
  title,
  description,
  basePath,
  isAuthenticated = true,
}: CategoryHubClientProps) {
  const [view, setView] = useViewPreference()

  return (
    <div className="mx-auto flex w-full flex-col gap-8">
      {/* Header */}
      <SectionHeading
        subtitle={description}
        action={<ViewToggle view={view} onViewChange={setView} />}
      >
        {title}
      </SectionHeading>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Link href={basePath}>
          <FilterChip label="All" active={activeFilter === 'All'} />
        </Link>
        {filters.map((filter) => (
          <Link key={filter.slug} href={`${basePath}/${filter.slug}`}>
            <FilterChip label={filter.label} active={activeFilter === filter.label} />
          </Link>
        ))}
      </div>

      {/* Articles */}
      {articles.length > 0 ? (
        view === 'grid' ? (
          <div className="flex flex-col gap-6">
            {articles[0] && (
              <ArticleCard
                {...articles[0]}
                hero
                isAuthenticated={isAuthenticated}
                headingLevel="h2"
              />
            )}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 [&>*]:h-full">
              {articles.slice(1).map((article) => (
                <ArticleCard
                  key={article.slug}
                  {...article}
                  isAuthenticated={isAuthenticated}
                  headingLevel="h2"
                />
              ))}
            </div>
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
          </div>
        )
      ) : activeFilter === 'All' ? (
        <EmptyState
          title="No articles yet"
          message={`${title} content will appear here as it's published.`}
        />
      ) : (
        <EmptyState
          title="No results"
          message={`No articles match the "${activeFilter}" filter. Try a different category or browse all.`}
        />
      )}
    </div>
  )
}
