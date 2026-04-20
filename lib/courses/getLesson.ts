import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function getLessonBySlug(slug: string) {
  const payload = await getPayload({ config: configPromise })

  const { docs } = await payload.find({
    collection: 'lessons',
    where: {
      slug: { equals: slug },
      status: { equals: 'published' },
    },
    limit: 1,
    depth: 2, // resolve module → course
    overrideAccess: true,
  })

  return docs[0] ?? null
}
