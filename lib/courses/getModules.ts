import { getPayload } from 'payload'
import configPromise from '@payload-config'

export interface CourseModule {
  id: number
  title: string
  slug: string
  description?: string
  order: number
  lessons: CourseLesson[]
}

export interface CourseLesson {
  id: number
  title: string
  slug: string
  order: number
  estimatedDuration?: number
  isFreePreview: boolean
  videoUrl?: string
}

/**
 * Get all published modules for a course, each with their published lessons.
 * Returns modules sorted by `order`, each containing lessons sorted by `order`.
 */
export async function getCourseModulesWithLessons(courseId: number): Promise<CourseModule[]> {
  const payload = await getPayload({ config: configPromise })

  const { docs: modules } = await payload.find({
    collection: 'modules',
    where: {
      course: { equals: courseId },
      status: { equals: 'published' },
    },
    sort: 'order',
    limit: 100,
    depth: 0,
    overrideAccess: true,
  })

  const moduleIds = modules.map((m) => m.id)
  if (moduleIds.length === 0) return []

  const { docs: lessons } = await payload.find({
    collection: 'lessons',
    where: {
      module: { in: moduleIds },
      status: { equals: 'published' },
    },
    sort: 'order',
    limit: 500,
    depth: 0,
    overrideAccess: true,
  })

  const lessonsByModule = new Map<number, CourseLesson[]>()
  for (const lesson of lessons) {
    const moduleId =
      typeof lesson.module === 'object' && lesson.module !== null
        ? (lesson.module as { id: number }).id
        : (lesson.module as number)

    if (!lessonsByModule.has(moduleId)) {
      lessonsByModule.set(moduleId, [])
    }
    lessonsByModule.get(moduleId)!.push({
      id: lesson.id as number,
      title: lesson.title,
      slug: lesson.slug,
      order: lesson.order,
      estimatedDuration: lesson.estimatedDuration ?? undefined,
      isFreePreview: lesson.isFreePreview ?? false,
      videoUrl: lesson.videoUrl ?? undefined,
    })
  }

  return modules.map((m) => ({
    id: m.id as number,
    title: m.title,
    slug: m.slug,
    description: m.description ?? undefined,
    order: m.order,
    lessons: (lessonsByModule.get(m.id as number) ?? []).sort((a, b) => a.order - b.order),
  }))
}
