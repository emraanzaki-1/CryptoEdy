'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ArticleCard, type ArticleCardProps } from '@/components/feed/article-card'
import { Button } from '@/components/ui/button'

const AUTO_SCROLL_INTERVAL = 4000

export function RecommendedArticles({ articles }: { articles: ArticleCardProps[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const autoScrollTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  const getCardWidth = useCallback(() => {
    const el = scrollRef.current
    if (!el) return 300
    const firstCard = el.firstElementChild as HTMLElement | null
    if (!firstCard) return 300
    // card width + gap (24px)
    return firstCard.offsetWidth + 24
  }, [])

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
      const amount = direction === 'left' ? -getCardWidth() : getCardWidth()
      el.scrollBy({ left: amount, behavior: 'smooth' })
      setTimeout(updateScrollState, 350)
    },
    [updateScrollState, getCardWidth]
  )

  const resetAutoScroll = useCallback(() => {
    if (autoScrollTimer.current) clearInterval(autoScrollTimer.current)
    autoScrollTimer.current = setInterval(() => {
      const el = scrollRef.current
      if (!el) return
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 1) {
        el.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        el.scrollBy({ left: getCardWidth(), behavior: 'smooth' })
      }
      setTimeout(updateScrollState, 350)
    }, AUTO_SCROLL_INTERVAL)
  }, [updateScrollState, getCardWidth])

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
    <section className="mt-10 pt-10">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-on-background text-subtitle font-bold">Recommended from CryptoEdy</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-lg"
            onClick={() => handleNav('left')}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
            className="border-outline-variant/15 text-on-surface-variant hover:bg-surface-container-high rounded-full border"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-lg"
            onClick={() => handleNav('right')}
            disabled={!canScrollRight}
            aria-label="Scroll right"
            className="border-outline-variant/15 text-on-surface-variant hover:bg-surface-container-high rounded-full border"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={updateScrollState}
        onMouseEnter={() => {
          if (autoScrollTimer.current) clearInterval(autoScrollTimer.current)
        }}
        onMouseLeave={resetAutoScroll}
        className="scrollbar-hide flex gap-6 overflow-x-auto"
      >
        {articles.map((article) => (
          <div
            key={article.slug}
            className="w-[85vw] shrink-0 sm:w-[calc((100%-24px)/2)] lg:w-[calc((100%-48px)/3)]"
          >
            <ArticleCard {...article} />
          </div>
        ))}
      </div>
    </section>
  )
}
