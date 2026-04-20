import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function getCourses() {
  const payload = await getPayload({ config: configPromise })

  const { docs } = await payload.find({
    collection: 'courses',
    where: { status: { equals: 'published' } },
    sort: 'order',
    depth: 1,
    limit: 100,
    overrideAccess: true,
  })

  return docs
}

export async function getCourseBySlug(slug: string) {
  const payload = await getPayload({ config: configPromise })

  const { docs } = await payload.find({
    collection: 'courses',
    where: {
      slug: { equals: slug },
      status: { equals: 'published' },
    },
    limit: 1,
    depth: 1,
    overrideAccess: true,
  })

  return docs[0] ?? null
}
