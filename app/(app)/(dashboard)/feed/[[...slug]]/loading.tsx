import Link from 'next/link'
import { FilterChip } from '@/components/ui/filter-chip'
import { getNavCategories } from '@/lib/categories/getCategories'
import { FeedCardsSkeleton, FeedCardsSkeltonGrid } from '@/components/feed/feed-cards-skeleton'

export default async function FeedLoading() {
  const navCategories = await getNavCategories()
  const filters = navCategories.map((c) => ({ label: c.label, slug: c.slug }))

  return (
    <div className="mx-auto flex w-full flex-col gap-8">
      <FeedCardsSkeleton />

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
