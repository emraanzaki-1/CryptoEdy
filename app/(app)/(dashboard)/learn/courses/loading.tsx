export default function CoursesLoading() {
  return (
    <div className="mx-auto flex w-full flex-col gap-8">
      <div className="bg-surface-container-low h-8 w-48 animate-pulse rounded-lg" />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-surface-container-low flex flex-col gap-4 rounded-2xl p-6">
            <div className="bg-surface-container h-40 animate-pulse rounded-xl" />
            <div className="bg-surface-container h-5 w-3/4 animate-pulse rounded" />
            <div className="bg-surface-container h-4 w-full animate-pulse rounded" />
            <div className="bg-surface-container h-4 w-2/3 animate-pulse rounded" />
            <div className="bg-surface-container h-10 w-32 animate-pulse rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  )
}
