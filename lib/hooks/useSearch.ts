'use client'

import { useState, useEffect, useRef } from 'react'
import { useDebounce } from './useDebounce'
import type { SearchResult } from '@/app/(app)/api/search/route'

interface UseSearchReturn {
  results: SearchResult[]
  isLoading: boolean
  error: string | null
}

const EMPTY_RESULTS: SearchResult[] = []

export function useSearch(query: string): UseSearchReturn {
  // Store the last completed fetch result, keyed by the query that produced it
  const [fetchedData, setFetchedData] = useState<{
    query: string
    results: SearchResult[]
    error: string | null
  }>({ query: '', results: EMPTY_RESULTS, error: null })
  const abortRef = useRef<AbortController | null>(null)

  const debouncedQuery = useDebounce(query.trim(), 300)

  useEffect(() => {
    abortRef.current?.abort()

    if (!debouncedQuery) {
      return
    }

    const controller = new AbortController()
    abortRef.current = controller

    fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error('Search failed')
        return res.json()
      })
      .then((data) => {
        if (!controller.signal.aborted) {
          setFetchedData({
            query: debouncedQuery,
            results: data.results ?? EMPTY_RESULTS,
            error: null,
          })
        }
      })
      .catch((err) => {
        if (err.name === 'AbortError') return
        if (!controller.signal.aborted) {
          setFetchedData({
            query: debouncedQuery,
            results: EMPTY_RESULTS,
            error: 'Search failed. Please try again.',
          })
        }
      })

    return () => controller.abort()
  }, [debouncedQuery])

  // Derive loading state: we have a query but no matching result yet
  if (!debouncedQuery) {
    return { results: EMPTY_RESULTS, isLoading: false, error: null }
  }

  const isLoading = fetchedData.query !== debouncedQuery
  return {
    results: isLoading ? EMPTY_RESULTS : fetchedData.results,
    isLoading,
    error: isLoading ? null : fetchedData.error,
  }
}
