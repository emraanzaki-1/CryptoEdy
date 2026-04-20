import type { CourseModule } from './getModules'

/**
 * Determine if a lesson is unlocked (accessible) based on sequential completion rules.
 *
 * Rules:
 * - The first lesson of the first module is always unlocked.
 * - A lesson is unlocked if the previous lesson (by order within the same module) is completed.
 * - The first lesson of a module is unlocked if the last lesson of the previous module is completed.
 */
export function isLessonUnlocked(
  lessonId: number,
  modules: CourseModule[],
  completedLessonIds: Set<number>
): boolean {
  // Build a flat ordered list of all lessons across all modules
  const flatLessons: { id: number; moduleIndex: number; lessonIndex: number }[] = []
  for (let mi = 0; mi < modules.length; mi++) {
    const mod = modules[mi]
    for (let li = 0; li < mod.lessons.length; li++) {
      flatLessons.push({ id: mod.lessons[li].id, moduleIndex: mi, lessonIndex: li })
    }
  }

  const currentIndex = flatLessons.findIndex((l) => l.id === lessonId)
  if (currentIndex === -1) return false

  // First lesson is always unlocked
  if (currentIndex === 0) return true

  // Lesson is unlocked if the previous lesson in the sequence is completed
  const previousLesson = flatLessons[currentIndex - 1]
  return completedLessonIds.has(previousLesson.id)
}

/**
 * Get the next lesson in sequence after the given lesson.
 * Returns null if the given lesson is the last in the course.
 */
export function getNextLesson(
  currentLessonId: number,
  modules: CourseModule[]
): { id: number; slug: string; title: string } | null {
  const flatLessons = modules.flatMap((m) => m.lessons)
  const currentIndex = flatLessons.findIndex((l) => l.id === currentLessonId)
  if (currentIndex === -1 || currentIndex === flatLessons.length - 1) return null

  const next = flatLessons[currentIndex + 1]
  return { id: next.id, slug: next.slug, title: next.title }
}

/**
 * Get the previous lesson in sequence before the given lesson.
 * Returns null if the given lesson is the first in the course.
 */
export function getPreviousLesson(
  currentLessonId: number,
  modules: CourseModule[]
): { id: number; slug: string; title: string } | null {
  const flatLessons = modules.flatMap((m) => m.lessons)
  const currentIndex = flatLessons.findIndex((l) => l.id === currentLessonId)
  if (currentIndex <= 0) return null

  const prev = flatLessons[currentIndex - 1]
  return { id: prev.id, slug: prev.slug, title: prev.title }
}
