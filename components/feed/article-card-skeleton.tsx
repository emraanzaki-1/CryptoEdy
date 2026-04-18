import { Skeleton } from '@/components/ui/skeleton'

export function ArticleCardSkeleton({ hero = false }: { hero?: boolean }) {
  if (hero) {
    return (
      <div className="border-outline-variant/10 bg-surface-container-lowest flex flex-col overflow-hidden rounded-2xl border md:flex-row">
        <Skeleton className="aspect-[16/9] w-full md:aspect-auto md:w-1/2 md:flex-shrink-0" />
        <div className="flex flex-col justify-center gap-4 p-8">
          <Skeleton className="h-8 w-3/4 rounded-lg" />
          <Skeleton className="h-5 w-full rounded-lg" />
          <Skeleton className="h-5 w-5/6 rounded-lg" />
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-4 w-16 rounded" />
            </div>
            <Skeleton className="h-4 w-16 rounded" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="border-outline-variant/10 bg-surface-container-lowest flex flex-col overflow-hidden rounded-2xl border">
      <Skeleton className="aspect-[16/10] w-full" />
      <div className="flex flex-col gap-3 p-5">
        <Skeleton className="h-5 w-full rounded-lg" />
        <Skeleton className="h-5 w-4/5 rounded-lg" />
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-3/4 rounded" />
        <div className="mt-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-4 w-12 rounded" />
          </div>
          <Skeleton className="h-4 w-16 rounded" />
        </div>
      </div>
    </div>
  )
}

export function ArticleCardListSkeleton() {
  return (
    <div className="border-outline-variant/10 bg-surface-container-lowest flex overflow-hidden rounded-2xl border">
      <Skeleton className="w-56 flex-shrink-0 sm:w-64" style={{ minHeight: '160px' }} />
      <div className="flex flex-1 flex-col justify-center gap-3 p-5">
        <Skeleton className="h-5 w-full rounded-lg" />
        <Skeleton className="h-5 w-4/5 rounded-lg" />
        <Skeleton className="h-4 w-full rounded" />
        <div className="mt-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-4 w-12 rounded" />
          </div>
          <Skeleton className="h-4 w-16 rounded" />
        </div>
      </div>
    </div>
  )
}

export function FeedGridSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <ArticleCardSkeleton hero />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ArticleCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

export function FeedListSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <ArticleCardListSkeleton key={i} />
      ))}
    </div>
  )
}
