'use client'

import { useState } from 'react'
import { ViewToggle } from '@/components/feed/view-toggle'
import { ArticleCard } from '@/components/feed/article-card'
import { ArticleCardList } from '@/components/feed/article-card-list'
import { EmptyState } from '@/components/common/empty-state'
import type { ArticleCardProps } from '@/components/feed/article-card'

interface TagClientProps {
  tagName: string
  articles: ArticleCardProps[]
  subtitle?: string
  emptyTitle?: string
  emptyMessage?: string
}

export function TagClient({
  tagName,
  articles,
  subtitle,
  emptyTitle,
  emptyMessage,
}: TagClientProps) {
  const [view, setView] = useState<'grid' | 'list'>('grid')

  const defaultSubtitle = tagName
    ? `${articles.length} ${articles.length === 1 ? 'article' : 'articles'} tagged with #${tagName}`
    : `${articles.length} ${articles.length === 1 ? 'article' : 'articles'}`

  return (
    <>
      <div className="flex items-end justify-between">
        <p className="text-on-surface-variant text-base">{subtitle ?? defaultSubtitle}</p>
        <ViewToggle view={view} onViewChange={setView} />
      </div>

      {articles.length > 0 ? (
        view === 'grid' ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 [&>*]:h-full">
            {articles.map((article) => (
              <ArticleCard key={article.slug} {...article} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {articles.map((article) => (
              <ArticleCardList key={article.slug} {...article} />
            ))}
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
