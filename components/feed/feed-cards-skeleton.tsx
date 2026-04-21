'use client'

import { FeedGridSkeleton, FeedListSkeleton } from '@/components/feed/article-card-skeleton'
import { ViewToggle } from '@/components/feed/view-toggle'
import { useViewPreference } from '@/lib/hooks/useViewPreference'
import { Heading, Body } from '@/components/ui/typography'

export function FeedCardsSkeleton({ title = 'Your feed' }: { title?: string }) {
  const [view, setView] = useViewPreference()

  return (
    <>
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Heading as="h1">{title}</Heading>
          <Body size="lg" className="text-on-surface-variant mt-2">
            Curated financial intelligence and market analysis.
          </Body>
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
