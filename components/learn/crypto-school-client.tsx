'use client'

import Link from 'next/link'
import { FilterChip } from '@/components/ui/filter-chip'
import { ViewToggle } from '@/components/feed/view-toggle'
import { ArticleCard } from '@/components/feed/article-card'
import { EmptyState } from '@/components/common/empty-state'
import { SectionHeading } from '@/components/common/section-heading'
import { useViewPreference } from '@/lib/hooks/useViewPreference'
import type { ArticleCardProps } from '@/components/feed/article-card'

interface CryptoSchoolClientProps {
  articles: ArticleCardProps[]
  filters: { label: string; slug: string }[]
  activeFilter?: string
}

export function CryptoSchoolClient({
  articles,
  filters,
  activeFilter = 'All',
}: CryptoSchoolClientProps) {
  const [view, setView] = useViewPreference()

  return (
    <div className="mx-auto flex w-full flex-col gap-8">
      {/* Header */}
      <SectionHeading
        subtitle="Learn crypto from the ground up — simply explained, guides, videos, and blueprints."
        action={<ViewToggle view={view} onViewChange={setView} />}
      >
        Crypto School
      </SectionHeading>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Link href="/learn">
          <FilterChip label="All" active={activeFilter === 'All'} />
        </Link>
        {filters.map((filter) => (
          <Link key={filter.slug} href={`/learn/${filter.slug}`}>
            <FilterChip label={filter.label} active={activeFilter === filter.label} />
          </Link>
        ))}
      </div>

      {/* Articles */}
      {articles.length > 0 ? (
        view === 'grid' ? (
          <div className="flex flex-col gap-6">
            {articles[0] && <ArticleCard {...articles[0]} hero />}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 [&>*]:h-full">
              {articles.slice(1).map((article) => (
                <ArticleCard key={article.slug} {...article} />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {articles.map((article) => (
              <ArticleCard key={article.slug} {...article} layout="list" />
            ))}
          </div>
        )
      ) : (
        <EmptyState
          title="No articles yet"
          message="Crypto School content will appear here as it's published."
        />
      )}
    </div>
  )
}
