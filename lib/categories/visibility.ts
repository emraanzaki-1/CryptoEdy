import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'

/**
 * Serializable category visibility index.
 * Built once from a single "fetch all categories" query.
 * Handles inheritance: if a parent is disabled, all descendants are effectively disabled.
 */
export interface CategoryVisibility {
  /** Map from category ID to effective enabled state */
  enabledById: Record<string, boolean>
  /** Map from category slug to effective enabled state */
  enabledBySlug: Record<string, boolean>
  /** All effectively-disabled category IDs (for use in Payload `not_in` queries) */
  disabledIds: (string | number)[]
}

interface RawCategory {
  id: string | number
  slug: string
  enabled?: boolean | null
  parent?: { id: string | number } | string | number | null
}

async function buildCategoryVisibility(): Promise<CategoryVisibility> {
  const payload = await getPayload({ config: configPromise })

  const { docs } = await payload.find({
    collection: 'categories',
    limit: 500,
    depth: 1,
    overrideAccess: true,
  })

  const categories = docs as unknown as RawCategory[]

  // Build parent lookup
  const parentIdOf = new Map<string, string>()
  const ownEnabled = new Map<string, boolean>()

  for (const cat of categories) {
    const id = String(cat.id)
    ownEnabled.set(id, cat.enabled !== false) // default true
    if (cat.parent) {
      const pid = typeof cat.parent === 'object' ? String(cat.parent.id) : String(cat.parent)
      parentIdOf.set(id, pid)
    }
  }

  // Compute effective enabled: walk up ancestor chain
  const effectiveCache = new Map<string, boolean>()

  function isEffectivelyEnabled(id: string): boolean {
    if (effectiveCache.has(id)) return effectiveCache.get(id)!

    const self = ownEnabled.get(id) ?? true
    if (!self) {
      effectiveCache.set(id, false)
      return false
    }

    const pid = parentIdOf.get(id)
    if (!pid) {
      effectiveCache.set(id, true)
      return true
    }

    const parentEnabled = isEffectivelyEnabled(pid)
    effectiveCache.set(id, parentEnabled)
    return parentEnabled
  }

  const enabledById: Record<string, boolean> = {}
  const enabledBySlug: Record<string, boolean> = {}
  const disabledIds: (string | number)[] = []

  for (const cat of categories) {
    const id = String(cat.id)
    const enabled = isEffectivelyEnabled(id)
    enabledById[id] = enabled
    enabledBySlug[cat.slug] = enabled
    if (!enabled) disabledIds.push(cat.id)
  }

  return { enabledById, enabledBySlug, disabledIds }
}

export const getCategoryVisibility = unstable_cache(
  buildCategoryVisibility,
  ['category-visibility'],
  { revalidate: 60, tags: ['categories'] }
)
