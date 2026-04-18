import { Skeleton } from '@/components/ui/skeleton'

export function ArticleSkeleton() {
  return (
    <article className="mx-auto max-w-4xl">
      {/* Breadcrumb */}
      <div className="mb-8 flex items-center gap-2">
        <Skeleton className="h-4 w-12 rounded" />
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-20 rounded" />
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-48 rounded" />
      </div>

      {/* Badges */}
      <div className="mb-6 flex items-center gap-3">
        <Skeleton className="h-6 w-14 rounded-full" />
        <Skeleton className="h-5 w-28 rounded" />
      </div>

      {/* Title */}
      <Skeleton className="mb-3 h-10 w-full rounded-xl" />
      <Skeleton className="mb-10 h-10 w-3/4 rounded-xl" />

      {/* Author row */}
      <div className="mb-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="size-12 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-36 rounded" />
            <Skeleton className="h-3 w-48 rounded" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="size-10 rounded-full" />
          <Skeleton className="size-10 rounded-full" />
        </div>
      </div>

      {/* Hero image */}
      <Skeleton className="mb-10 h-[400px] w-full rounded-2xl" />

      {/* Hook paragraph */}
      <Skeleton className="mb-8 h-24 w-full rounded-xl" />

      {/* Body paragraphs */}
      <div className="flex flex-col gap-4">
        <Skeleton className="h-5 w-full rounded" />
        <Skeleton className="h-5 w-full rounded" />
        <Skeleton className="h-5 w-5/6 rounded" />
        <Skeleton className="h-5 w-full rounded" />
        <Skeleton className="h-5 w-4/5 rounded" />
      </div>
    </article>
  )
}
