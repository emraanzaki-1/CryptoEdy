'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Clock, Lock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import type { ArticleCardProps } from '@/components/feed/article-card'

function RecommendedCard({ article }: { article: ArticleCardProps }) {
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group flex w-[280px] shrink-0 flex-col overflow-hidden rounded-2xl md:w-[300px]"
    >
      {/* Image */}
      <div className="bg-surface-container relative aspect-[16/10] overflow-hidden rounded-2xl">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          role="img"
          aria-label={article.imageAlt}
          style={{ backgroundImage: `url('${article.imageUrl}')` }}
        />
        {article.isPro && (
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent" />
        )}
        {article.isPro && (
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <Badge variant="pro" className="shadow-sm">
              PRO
            </Badge>
            <span className="text-overline flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 font-semibold text-white backdrop-blur-sm">
              <Lock className="size-2.5" />
              Members only
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 pt-4">
        <div className="flex items-center gap-2">
          <span className="bg-surface-container text-on-surface-variant text-label inline-flex items-center rounded-full px-2.5 py-0.5 font-semibold uppercase">
            {article.category}
          </span>
          {article.isPro && <Badge variant="pro">PRO</Badge>}
        </div>

        <h3 className="text-on-surface group-hover:text-primary line-clamp-2 text-sm leading-snug font-bold transition-colors">
          {article.title}
        </h3>

        <p className="text-on-surface-variant line-clamp-2 text-xs leading-relaxed">
          {article.excerpt}
        </p>

        <div className="text-outline mt-auto flex items-center gap-3 pt-1 text-xs">
          <span className="flex items-center gap-1">
            <Clock className="size-3" />
            {article.readTime}
          </span>
          <span>{article.date}</span>
        </div>
      </div>
    </Link>
  )
}

const AUTO_SCROLL_INTERVAL = 4000
const SCROLL_AMOUNT = 316 // card width (300) + gap (16)

export function RecommendedArticles({ articles }: { articles: ArticleCardProps[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const autoScrollTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }, [])

  const scroll = useCallback(
    (direction: 'left' | 'right') => {
      const el = scrollRef.current
      if (!el) return
      const amount = direction === 'left' ? -SCROLL_AMOUNT : SCROLL_AMOUNT
      el.scrollBy({ left: amount, behavior: 'smooth' })
      // Update state after animation
      setTimeout(updateScrollState, 350)
    },
    [updateScrollState]
  )

  const resetAutoScroll = useCallback(() => {
    if (autoScrollTimer.current) clearInterval(autoScrollTimer.current)
    autoScrollTimer.current = setInterval(() => {
      const el = scrollRef.current
      if (!el) return
      // If at the end, scroll back to start
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 1) {
        el.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        el.scrollBy({ left: SCROLL_AMOUNT, behavior: 'smooth' })
      }
      setTimeout(updateScrollState, 350)
    }, AUTO_SCROLL_INTERVAL)
  }, [updateScrollState])

  useEffect(() => {
    updateScrollState()
    resetAutoScroll()
    return () => {
      if (autoScrollTimer.current) clearInterval(autoScrollTimer.current)
    }
  }, [updateScrollState, resetAutoScroll])

  const handleNav = (direction: 'left' | 'right') => {
    scroll(direction)
    resetAutoScroll()
  }

  if (articles.length === 0) return null

  return (
    <section className="border-outline-variant/15 mt-10 border-t pt-10">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-on-background text-lg font-bold">Recommended from CryptoEdy</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleNav('left')}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
            className="border-outline-variant/15 text-on-surface-variant hover:bg-surface-container-high disabled:text-outline/30 flex size-9 items-center justify-center rounded-full border transition-colors disabled:cursor-not-allowed"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            onClick={() => handleNav('right')}
            disabled={!canScrollRight}
            aria-label="Scroll right"
            className="border-outline-variant/15 text-on-surface-variant hover:bg-surface-container-high disabled:text-outline/30 flex size-9 items-center justify-center rounded-full border transition-colors disabled:cursor-not-allowed"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={updateScrollState}
        onMouseEnter={() => {
          if (autoScrollTimer.current) clearInterval(autoScrollTimer.current)
        }}
        onMouseLeave={resetAutoScroll}
        className="scrollbar-hide flex gap-4 overflow-x-auto"
      >
        {articles.map((article) => (
          <RecommendedCard key={article.slug} article={article} />
        ))}
      </div>
    </section>
  )
}
