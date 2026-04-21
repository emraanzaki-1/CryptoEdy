import Link from 'next/link'
import { FilterChip } from '@/components/ui/filter-chip'
import { getNavCategories } from '@/lib/categories/getCategories'
import { FeedCardsSkeleton, FeedCardsSkeltonGrid } from '@/components/feed/feed-cards-skeleton'
import { auth } from '@/lib/auth'

export default async function FeedLoading() {
  const [navCategories, session] = await Promise.all([getNavCategories(), auth()])
  const filters = navCategories
    .filter((c) => c.slug !== 'education')
    .map((c) => ({ label: c.label, slug: c.slug }))

  const title = session?.user ? 'Your feed' : 'All Articles'

  return (
    <div className="mx-auto flex w-full flex-col gap-8">
      <FeedCardsSkeleton title={title} />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Link href="/feed">
          <FilterChip label="All" active={false} />
        </Link>
        {filters.map((filter) => (
          <Link key={filter.slug} href={`/feed/${filter.slug}`}>
            <FilterChip label={filter.label} active={false} />
          </Link>
        ))}
      </div>

      <FeedCardsSkeltonGrid />
    </div>
  )
}
