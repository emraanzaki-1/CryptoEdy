import { Skeleton } from '@/components/ui/skeleton'

export default function SettingsLoading() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 lg:flex-row">
      {/* Settings sidebar */}
      <aside className="w-full flex-shrink-0 lg:w-56">
        <div className="flex flex-col gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      </aside>

      {/* Settings content */}
      <div className="flex flex-1 flex-col gap-8">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-8 w-48 rounded-xl" />
          <Skeleton className="h-4 w-72 rounded" />
        </div>
        <div className="flex flex-col gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
          ))}
        </div>
        <Skeleton className="h-11 w-32 rounded-xl" />
      </div>
    </div>
  )
}
