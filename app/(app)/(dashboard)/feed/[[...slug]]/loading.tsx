import { FeedGridSkeleton } from '@/components/feed/article-card-skeleton'
import { Skeleton } from '@/components/ui/skeleton'

export default function FeedLoading() {
  return (
    <div className="mx-auto flex w-full flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-12 w-48 rounded-xl" />
          <Skeleton className="h-5 w-72 rounded" />
        </div>
        <Skeleton className="h-9 w-20 rounded-lg" />
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>

      <FeedGridSkeleton />
    </div>
  )
}
