'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Clock,
  ArrowUpLeft,
  FileText,
  ChevronRight,
  Home,
  Wrench,
  Settings,
  Zap,
  X,
  BookOpen,
  Play,
} from 'lucide-react'
import { useSearch } from '@/lib/hooks/useSearch'
import { FormInput } from '@/components/ui/form-field'
import type { SearchResult, SearchResultType } from '@/app/(app)/api/search/route'

const RESULT_TYPE_CONFIG: Record<
  SearchResultType,
  { label: string; icon: typeof FileText; colorClass: string }
> = {
  post: { label: 'Articles', icon: FileText, colorClass: 'bg-primary/10 text-primary' },
  course: { label: 'Courses', icon: BookOpen, colorClass: 'bg-tertiary/10 text-tertiary' },
  lesson: { label: 'Lessons', icon: Play, colorClass: 'bg-secondary/10 text-secondary' },
}

function getResultHref(result: SearchResult): string {
  switch (result.type) {
    case 'course':
      return `/learn/courses/${result.slug}`
    case 'lesson':
      return `/learn/courses/${result.courseSlug}/${result.slug}`
    default:
      return `/articles/${result.slug}`
  }
}

function groupResultsByType(
  results: SearchResult[]
): { type: SearchResultType; results: SearchResult[] }[] {
  const order: SearchResultType[] = ['post', 'course', 'lesson']
  const map = new Map<SearchResultType, SearchResult[]>()
  for (const r of results) {
    const arr = map.get(r.type) ?? []
    arr.push(r)
    map.set(r.type, arr)
  }
  return order.filter((t) => map.has(t)).map((t) => ({ type: t, results: map.get(t)! }))
}

const RECENT_SEARCHES_KEY = 'cryptoedy-recent-searches'
const MAX_RECENT = 5

const QUICK_ACTIONS = [
  { label: 'Go to Feed', href: '/feed', icon: Home },
  { label: 'Tools', href: '/tools', icon: Wrench },
  { label: 'Settings', href: '/settings/profile', icon: Settings },
  { label: 'Upgrade to Pro', href: '/settings/plans', icon: Zap },
] as const

function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveRecentSearch(query: string) {
  const trimmed = query.trim()
  if (!trimmed) return
  const recents = getRecentSearches().filter((s) => s !== trimmed)
  recents.unshift(trimmed)
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recents.slice(0, MAX_RECENT)))
}

function removeRecentSearch(query: string) {
  const recents = getRecentSearches().filter((s) => s !== query)
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recents))
}

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const { results, isLoading, error } = useSearch(query)
  const hasQuery = query.trim().length > 0
  const showResults = hasQuery

  // Load recent searches when modal opens
  useEffect(() => {
    if (isOpen) {
      setRecentSearches(getRecentSearches())
      setQuery('')
      setActiveIndex(-1)
      // Focus input after a frame so the modal is rendered
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleResultClick = useCallback(
    (result: SearchResult) => {
      saveRecentSearch(query.trim())
      onClose()
      router.push(getResultHref(result))
    },
    [query, onClose, router]
  )

  function handleRecentClick(search: string) {
    setQuery(search)
    inputRef.current?.focus()
  }

  function handleRemoveRecent(e: React.MouseEvent, search: string) {
    e.stopPropagation()
    removeRecentSearch(search)
    setRecentSearches(getRecentSearches())
  }

  const handleActionClick = useCallback(
    (href: string) => {
      onClose()
      router.push(href)
    },
    [onClose, router]
  )

  // Build the flat list of navigable items for keyboard nav
  const getNavigableItems = useCallback((): Array<{
    type: 'recent' | 'action' | 'result'
    index: number
  }> => {
    if (showResults) {
      return results.map((_, i) => ({ type: 'result' as const, index: i }))
    }
    const items: Array<{ type: 'recent' | 'action' | 'result'; index: number }> = []
    recentSearches.forEach((_, i) => items.push({ type: 'recent', index: i }))
    QUICK_ACTIONS.forEach((_, i) => items.push({ type: 'action', index: i }))
    return items
  }, [showResults, results, recentSearches])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(e: KeyboardEvent) {
      const items = getNavigableItems()
      if (!items.length) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1))
      } else if (e.key === 'Enter' && activeIndex >= 0 && activeIndex < items.length) {
        e.preventDefault()
        const item = items[activeIndex]
        if (item.type === 'result') {
          handleResultClick(results[item.index])
        } else if (item.type === 'recent') {
          handleRecentClick(recentSearches[item.index])
        } else if (item.type === 'action') {
          handleActionClick(QUICK_ACTIONS[item.index].href)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [
    isOpen,
    activeIndex,
    getNavigableItems,
    results,
    recentSearches,
    handleResultClick,
    handleActionClick,
  ])

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return
    const el = listRef.current.querySelector(`[data-nav-index="${activeIndex}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  // Reset activeIndex when results or query change
  useEffect(() => {
    setActiveIndex(-1)
  }, [query, results.length])

  if (!isOpen) return null

  // Track nav index across sections
  let navIndex = 0

  return (
    <div className="fixed inset-0 z-100 flex items-start justify-center p-4 pt-[12dvh] md:p-12 md:pt-[15dvh]">
      {/* Backdrop */}
      <div className="bg-on-surface/40 absolute inset-0 backdrop-blur-md" onClick={onClose} />

      {/* Modal */}
      <div className="bg-surface-container-lowest border-outline-variant/10 shadow-modal relative w-full max-w-2xl overflow-hidden rounded-2xl border">
        {/* Search Header */}
        <div className="bg-surface-container-lowest relative flex items-center px-6 py-6">
          <Search className="text-primary mr-4 size-6 shrink-0" />
          <FormInput
            ref={inputRef}
            type="text"
            variant="ghost"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search research, assets, or actions..."
            className="text-subtitle font-medium"
          />
          <div className="bg-surface-container-low text-on-surface-variant/60 text-overline flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-bold">
            <span>⌘</span>
            <span>/</span>
          </div>
        </div>

        {/* Separator */}
        <div className="bg-outline-variant/10 h-px w-full" />

        {/* Scrollable content */}
        <div ref={listRef} className="max-h-[60dvh] overflow-y-auto overscroll-contain py-4">
          {showResults ? (
            /* ── Search Results ── */
            <>
              {isLoading ? (
                <div className="space-y-1 px-3">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex items-start gap-4 rounded-xl px-4 py-3">
                      <div className="bg-surface-container-low size-10 shrink-0 animate-pulse rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <div className="bg-surface-container-low h-4 w-3/4 animate-pulse rounded" />
                        <div className="bg-surface-container-low h-3 w-full animate-pulse rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="px-8 py-8 text-center">
                  <p className="text-on-surface-variant text-body-sm">{error}</p>
                </div>
              ) : results.length === 0 ? (
                <div className="px-8 py-8 text-center">
                  <p className="text-on-surface-variant text-body-sm">
                    No results found for &ldquo;{query.trim()}&rdquo;
                  </p>
                  <p className="text-on-surface-variant/60 text-label mt-1">
                    Try different keywords or check for typos
                  </p>
                </div>
              ) : (
                <>
                  {groupResultsByType(results).map((group) => {
                    const config = RESULT_TYPE_CONFIG[group.type]
                    const GroupIcon = config.icon
                    return (
                      <section key={group.type} className="mb-4 px-3 last:mb-0">
                        <h4 className="text-on-surface-variant/60 text-overline mb-2 px-4 font-black uppercase">
                          {config.label}
                        </h4>
                        <div className="space-y-0.5">
                          {group.results.map((result) => {
                            const idx = results.indexOf(result)
                            const isNew =
                              result.publishedAt &&
                              Date.now() - new Date(result.publishedAt).getTime() <
                                7 * 24 * 60 * 60 * 1000

                            return (
                              <button
                                key={`${result.type}-${result.id}`}
                                data-nav-index={idx}
                                onClick={() => handleResultClick(result)}
                                className={`group flex w-full items-start gap-4 rounded-xl px-4 py-3 text-left transition-all ${
                                  activeIndex === idx
                                    ? 'bg-surface-container-low'
                                    : 'hover:bg-surface-container-low'
                                }`}
                              >
                                <div
                                  className={`${config.colorClass} mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg`}
                                >
                                  <GroupIcon className="size-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="mb-0.5 flex items-center gap-2">
                                    <span
                                      className="text-on-surface text-body-sm truncate font-bold"
                                      dangerouslySetInnerHTML={{ __html: result.highlightedTitle }}
                                    />
                                    {isNew && (
                                      <span className="bg-secondary-container/20 text-on-secondary-container text-overline shrink-0 rounded px-1.5 py-0.5 font-bold uppercase">
                                        NEW
                                      </span>
                                    )}
                                    {result.isProOnly && (
                                      <span className="bg-tertiary-fixed text-on-tertiary-fixed text-overline shrink-0 rounded px-1.5 py-0.5 font-bold uppercase">
                                        PRO
                                      </span>
                                    )}
                                    {result.type === 'course' && result.difficulty && (
                                      <span className="bg-surface-container-low text-on-surface-variant text-overline shrink-0 rounded px-1.5 py-0.5 font-bold capitalize">
                                        {result.difficulty}
                                      </span>
                                    )}
                                    {result.type === 'lesson' && result.isFreePreview && (
                                      <span className="bg-secondary-container/20 text-on-secondary-container text-overline shrink-0 rounded px-1.5 py-0.5 font-bold uppercase">
                                        FREE
                                      </span>
                                    )}
                                  </div>
                                  {result.highlightedExcerpt && (
                                    <p
                                      className="text-on-surface-variant/70 text-label truncate"
                                      dangerouslySetInnerHTML={{
                                        __html: result.highlightedExcerpt,
                                      }}
                                    />
                                  )}
                                </div>
                                <ChevronRight className="text-on-surface-variant/30 group-hover:text-primary mt-2.5 size-4 shrink-0 transition-colors" />
                              </button>
                            )
                          })}
                        </div>
                      </section>
                    )
                  })}
                </>
              )}
            </>
          ) : (
            /* ── Default State: Recent Searches + Quick Actions ── */
            <>
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <section className="mb-6 px-3">
                  <h4 className="text-on-surface-variant/60 text-overline mb-2 px-4 font-black uppercase">
                    Recent Searches
                  </h4>
                  <div className="space-y-0.5">
                    {recentSearches.map((search) => {
                      const idx = navIndex++
                      return (
                        <button
                          key={search}
                          data-nav-index={idx}
                          onClick={() => handleRecentClick(search)}
                          className={`group flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left transition-all ${
                            activeIndex === idx
                              ? 'bg-surface-container-low'
                              : 'hover:bg-surface-container-low'
                          }`}
                        >
                          <Clock className="text-on-surface-variant/40 group-hover:text-primary size-5 shrink-0 transition-colors" />
                          <span className="text-on-surface-variant group-hover:text-on-surface text-body-sm min-w-0 flex-1 truncate font-medium">
                            {search}
                          </span>
                          <span
                            role="button"
                            tabIndex={-1}
                            onClick={(e) => handleRemoveRecent(e, search)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter')
                                handleRemoveRecent(e as unknown as React.MouseEvent, search)
                            }}
                            className="text-on-surface-variant/30 hover:text-on-surface-variant shrink-0 cursor-pointer opacity-0 transition-all group-hover:opacity-100"
                          >
                            <X className="size-4" />
                          </span>
                          <ArrowUpLeft className="text-on-surface-variant/30 shrink-0 opacity-0 transition-all group-hover:opacity-100" />
                        </button>
                      )
                    })}
                  </div>
                </section>
              )}

              {/* Quick Actions */}
              <section className="px-3">
                <h4 className="text-on-surface-variant/60 text-overline mb-2 px-4 font-black uppercase">
                  Quick Actions
                </h4>
                <div className="grid grid-cols-2 gap-2 p-1">
                  {QUICK_ACTIONS.map((action) => {
                    const idx = navIndex++
                    const Icon = action.icon
                    return (
                      <button
                        key={action.href}
                        data-nav-index={idx}
                        onClick={() => handleActionClick(action.href)}
                        className={`group flex items-center gap-3 rounded-xl border border-transparent p-3 text-left transition-all ${
                          activeIndex === idx
                            ? 'bg-surface-container-low border-outline-variant/30'
                            : 'hover:border-outline-variant/30 hover:bg-surface-container-low'
                        }`}
                      >
                        <Icon className="text-primary size-5 transition-transform group-hover:scale-110" />
                        <span className="text-on-surface-variant group-hover:text-on-surface text-label font-bold">
                          {action.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </section>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-surface-container-low/80 border-outline-variant/10 flex items-center justify-between border-t px-6 py-4">
          <div className="text-on-surface-variant/50 text-overline flex items-center gap-4 font-bold">
            <div className="flex items-center gap-1.5">
              <span className="bg-surface-container-lowest border-outline-variant/20 text-overline rounded border px-1.5 py-0.5 shadow-sm">
                ESC
              </span>
              <span>to close</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="bg-surface-container-lowest border-outline-variant/20 text-overline rounded border px-1.5 py-0.5 shadow-sm">
                ↵
              </span>
              <span>to select</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
