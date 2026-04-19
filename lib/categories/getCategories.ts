import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'

export interface NavCategory {
  label: string
  slug: string
  items: { label: string; slug: string; href: string }[]
}

async function fetchNavCategories(): Promise<NavCategory[]> {
  const payload = await getPayload({ config: configPromise })

  const { docs } = await payload.find({
    collection: 'categories',
    where: { parent: { exists: false } },
    sort: 'name',
    limit: 50,
    depth: 0,
    overrideAccess: true,
  })

  const parents = docs as { id: string | number; name: string; slug: string }[]

  const { docs: children } = await payload.find({
    collection: 'categories',
    where: { parent: { exists: true } },
    sort: 'name',
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
      parent: { id: string | number; slug: string } | string | number
    }
    const parentId = typeof c.parent === 'object' ? c.parent.id : c.parent

    if (!childrenByParent.has(parentId)) {
      childrenByParent.set(parentId, [])
    }

    childrenByParent.get(parentId)!.push({
      label: c.name,
      slug: c.slug,
      href: `/feed/${c.slug}`,
    })
  }

  return parents.map((p) => ({
    label: p.name,
    slug: p.slug,
    items: [
      { label: `All ${p.name}`, slug: p.slug, href: `/feed/${p.slug}` },
      ...(childrenByParent.get(p.id) ?? []),
    ],
  }))
}

export const getNavCategories = unstable_cache(fetchNavCategories, ['nav-categories'], {
  revalidate: 60,
  tags: ['categories'],
})
