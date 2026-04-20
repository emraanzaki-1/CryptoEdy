export function CategoryPill({ category }: { category: string }) {
  return (
    <span className="bg-surface-container text-on-surface-variant text-label inline-flex items-center rounded-full px-2.5 py-0.5 font-semibold uppercase">
      {category}
    </span>
  )
}
