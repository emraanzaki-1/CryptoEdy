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

/**
 * Fetch a lesson by slug, scoped to a specific course ID.
 * Prevents cross-course slug collisions by verifying the lesson's
 * module belongs to the given course.
 */
export async function getLessonBySlugForCourse(lessonSlug: string, courseId: number) {
  const payload = await getPayload({ config: configPromise })

  // First, get all module IDs for this course
  const { docs: modules } = await payload.find({
    collection: 'modules',
    where: {
      course: { equals: courseId },
      status: { equals: 'published' },
    },
    limit: 100,
    depth: 0,
    overrideAccess: true,
  })

  const moduleIds = modules.map((m) => m.id)
  if (moduleIds.length === 0) return null

  const { docs } = await payload.find({
    collection: 'lessons',
    where: {
      slug: { equals: lessonSlug },
      module: { in: moduleIds },
      status: { equals: 'published' },
    },
    limit: 1,
    depth: 2,
    overrideAccess: true,
  })

  return docs[0] ?? null
}
