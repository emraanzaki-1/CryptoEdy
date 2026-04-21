'use client'

import { FeedGridSkeleton, FeedListSkeleton } from '@/components/feed/article-card-skeleton'
import { ViewToggle } from '@/components/feed/view-toggle'
import { useViewPreference } from '@/lib/hooks/useViewPreference'

export function FeedCardsSkeleton() {
  const [view, setView] = useViewPreference()

  return (
    <>
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-on-surface text-headline font-bold">Your feed</h1>
          <p className="text-on-surface-variant text-body-lg mt-2">
            Curated financial intelligence and market analysis.
          </p>
        </div>
        <ViewToggle view={view} onViewChange={setView} />
      </div>
    </>
  )
}

export function FeedCardsSkeltonGrid() {
  const [view] = useViewPreference()
  return view === 'list' ? <FeedListSkeleton /> : <FeedGridSkeleton />
}
