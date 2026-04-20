import { getDb } from '@/lib/db'
import { courseEnrollments, lessonProgress } from '@/lib/db/schema'
import { eq, and, count } from 'drizzle-orm'

/**
 * Get enrollment record for a user in a specific course.
 */
export async function getEnrollment(userId: string, courseId: number) {
  const db = getDb()
  const [enrollment] = await db
    .select()
    .from(courseEnrollments)
    .where(and(eq(courseEnrollments.userId, userId), eq(courseEnrollments.courseId, courseId)))
    .limit(1)

  return enrollment ?? null
}

/**
 * Enroll a user in a course. Idempotent — returns existing enrollment if already enrolled.
 */
export async function enrollInCourse(userId: string, courseId: number) {
  const existing = await getEnrollment(userId, courseId)
  if (existing) return existing

  const db = getDb()
  const [enrollment] = await db.insert(courseEnrollments).values({ userId, courseId }).returning()

  return enrollment
}

/**
 * Get all completed lesson IDs for a user in a specific course.
 */
export async function getCompletedLessonIds(
  userId: string,
  courseId: number
): Promise<Set<number>> {
  const db = getDb()
  const rows = await db
    .select({ lessonId: lessonProgress.lessonId })
    .from(lessonProgress)
    .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.courseId, courseId)))

  return new Set(rows.map((r) => r.lessonId))
}

/**
 * Mark a lesson as completed. Idempotent.
 * Automatically sets course completedAt when all lessons are done.
 */
export async function markLessonComplete(
  userId: string,
  lessonId: number,
  courseId: number,
  totalLessons: number
) {
  const db = getDb()

  // Check if already completed
  const [existing] = await db
    .select()
    .from(lessonProgress)
    .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.lessonId, lessonId)))
    .limit(1)

  if (existing) return existing

  const [record] = await db
    .insert(lessonProgress)
    .values({ userId, lessonId, courseId })
    .returning()

  // Check if all lessons in the course are now completed
  const [{ completedCount }] = await db
    .select({ completedCount: count() })
    .from(lessonProgress)
    .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.courseId, courseId)))

  if (completedCount >= totalLessons) {
    await db
      .update(courseEnrollments)
      .set({ completedAt: new Date() })
      .where(and(eq(courseEnrollments.userId, userId), eq(courseEnrollments.courseId, courseId)))
  }

  return record
}

/**
 * Get all course IDs a user is enrolled in.
 */
export async function getUserEnrollments(userId: string) {
  const db = getDb()
  const rows = await db.select().from(courseEnrollments).where(eq(courseEnrollments.userId, userId))

  return rows
}
