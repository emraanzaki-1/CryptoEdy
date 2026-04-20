'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { ArticleCardProps } from '@/components/feed/article-card'

interface UseInfiniteScrollOptions {
  initialArticles: ArticleCardProps[]
  initialHasNextPage: boolean
  fetchUrl: string // base URL without `page` param, e.g. "/api/posts?category=research&limit=12"
}

interface UseInfiniteScrollReturn {
  articles: ArticleCardProps[]
  isLoading: boolean
  hasNextPage: boolean
  sentinelRef: React.RefCallback<HTMLElement>
}

export function useInfiniteScroll({
  initialArticles,
  initialHasNextPage,
  fetchUrl,
}: UseInfiniteScrollOptions): UseInfiniteScrollReturn {
  const [articles, setArticles] = useState(initialArticles)
  const [page, setPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage)
  const [isLoading, setIsLoading] = useState(false)

  // Reset when content changes (category navigation, unbookmark, etc.)
  const articlesKey = initialArticles.map((a) => a.slug).join(',')
  useEffect(() => {
    setArticles(initialArticles)
    setPage(1)
    setHasNextPage(initialHasNextPage)
    setIsLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articlesKey, fetchUrl])

  const loadMore = useCallback(async () => {
    if (isLoading || !hasNextPage) return

    setIsLoading(true)
    const nextPage = page + 1
    const separator = fetchUrl.includes('?') ? '&' : '?'
    const url = `${fetchUrl}${separator}page=${nextPage}`

    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)

      const data = await res.json()
      setArticles((prev) => [...prev, ...data.docs])
      setPage(nextPage)
      setHasNextPage(data.hasNextPage)
    } catch (err) {
      console.error('[useInfiniteScroll]', err)
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, hasNextPage, page, fetchUrl])

  // IntersectionObserver via ref callback
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef(loadMore)
  loadMoreRef.current = loadMore

  const sentinelRef = useCallback((node: HTMLElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }
    if (!node) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMoreRef.current()
        }
      },
      { rootMargin: '200px' }
    )

    observerRef.current.observe(node)
  }, [])

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      observerRef.current?.disconnect()
    }
  }, [])

  return { articles, isLoading, hasNextPage, sentinelRef }
}
