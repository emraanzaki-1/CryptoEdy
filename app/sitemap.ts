import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

const BASE_URL = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config: configPromise })

  // ── Static pages ────────────────────────────────────────────────────────────
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    {
      url: `${BASE_URL}/research`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/analysis`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/crypto-school`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/courses`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/legal/disclaimer`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
  ]

  // ── Published posts ──────────────────────────────────────────────────────────
  const { docs: posts } = await payload.find({
    collection: 'posts',
    where: { status: { equals: 'published' } },
    depth: 1,
    limit: 1000,
    overrideAccess: true,
    select: { slug: true, updatedAt: true, category: true },
  })

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => {
    const slug = post.slug as string
    const updatedAt = post.updatedAt as string

    // Determine the URL path based on the category's parent routePrefix
    const category = post.category as Record<string, unknown> | null | undefined
    const parent = category?.parent as Record<string, unknown> | null | undefined
    const routePrefix = (parent?.routePrefix as string) ?? (category?.routePrefix as string) ?? ''
    const basePath = routePrefix ? `/${routePrefix}` : '/articles'

    return {
      url: `${BASE_URL}${basePath}/${slug}`,
      lastModified: new Date(updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }
  })

  // ── Categories (parent only — these are the hub pages) ───────────────────────
  const { docs: categories } = await payload.find({
    collection: 'categories',
    where: { parent: { exists: false } },
    depth: 0,
    limit: 50,
    overrideAccess: true,
    select: { slug: true, routePrefix: true, updatedAt: true },
  })

  const categoryRoutes: MetadataRoute.Sitemap = categories
    .filter((c) => c.routePrefix as string | undefined)
    .map((c) => ({
      url: `${BASE_URL}/${c.routePrefix as string}`,
      lastModified: new Date(c.updatedAt as string),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    }))

  return [...staticRoutes, ...postRoutes, ...categoryRoutes]
}
