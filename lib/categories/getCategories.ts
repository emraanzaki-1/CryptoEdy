import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getCategoryVisibility } from './visibility'

export interface NavCategory {
  label: string
  slug: string
  /** URL prefix for the hub page, e.g. "research" or "analysis". Null for custom-routed parents. */
  routePrefix: string | null
  /** When true, posts in this category are excluded from the main /feed page. */
  excludeFromMainFeed: boolean
  items: { label: string; slug: string; href: string }[]
}

async function fetchNavCategories(): Promise<NavCategory[]> {
  const payload = await getPayload({ config: configPromise })
  const visibility = await getCategoryVisibility()

  const { docs } = await payload.find({
    collection: 'categories',
    where: { parent: { exists: false } },
    sort: 'weight',
    limit: 50,
    depth: 0,
    overrideAccess: true,
  })

  const parents = docs as {
    id: string | number
    name: string
    slug: string
    routePrefix?: string | null
    excludeFromMainFeed?: boolean | null
  }[]

  // Filter out disabled parents
  const enabledParents = parents.filter((p) => visibility.enabledById[String(p.id)] !== false)

  // Build lookup maps from parent data
  const parentRoutePrefixMap = new Map<string | number, string | null>()
  const parentExcludeMap = new Map<string | number, boolean>()
  for (const p of enabledParents) {
    parentRoutePrefixMap.set(p.id, p.routePrefix ?? null)
    parentExcludeMap.set(p.id, p.excludeFromMainFeed ?? false)
  }

  const { docs: children } = await payload.find({
    collection: 'categories',
    where: { parent: { exists: true } },
    sort: 'weight',
    limit: 200,
    depth: 1,
    overrideAccess: true,
  })

  const childrenByParent = new Map<
    string | number,
    { label: string; slug: string; href: string }[]
  >()

  for (const child of children) {
    const c = child as unknown as {
      name: string
      slug: string
      parent: { id: string | number; slug: string } | string | number | null
    }
    if (!c.parent) continue

    // Skip disabled children (own or inherited)
    if (visibility.enabledBySlug[c.slug] === false) continue

    const parentId = typeof c.parent === 'object' ? c.parent.id : c.parent

    if (!childrenByParent.has(parentId)) {
      childrenByParent.set(parentId, [])
    }

    const routePrefix = parentRoutePrefixMap.get(parentId) ?? null
    const excludeFromFeed = parentExcludeMap.get(parentId) ?? false

    let href: string
    if (routePrefix) {
      // Standard hub routing: /{routePrefix}/{childSlug}
      href = `/${routePrefix}/${c.slug}`
    } else if (excludeFromFeed) {
      // Custom-routed parent (e.g. Education): map known children to their dedicated routes
      href = c.slug === 'trading-course' ? '/learn/courses' : '/learn'
    } else {
      href = `/feed/${c.slug}`
    }

    childrenByParent.get(parentId)!.push({
      label: c.name,
      slug: c.slug,
      href,
    })
  }

  return enabledParents.map((p) => ({
    label: p.name,
    slug: p.slug,
    routePrefix: p.routePrefix ?? null,
    excludeFromMainFeed: p.excludeFromMainFeed ?? false,
    items: [
      ...(p.routePrefix
        ? [{ label: `All ${p.name}`, slug: p.slug, href: `/${p.routePrefix}` }]
        : []),
      ...(childrenByParent.get(p.id) ?? []),
    ],
  }))
}

export const getNavCategories = unstable_cache(fetchNavCategories, ['nav-categories'], {
  revalidate: 60,
  tags: ['categories'],
})
