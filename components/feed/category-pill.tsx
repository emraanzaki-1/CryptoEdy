import { Badge } from '@/components/ui/badge'

export function CategoryPill({ category }: { category: string }) {
  return <Badge variant="category">{category}</Badge>
}
