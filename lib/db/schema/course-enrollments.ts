import { pgTable, uuid, integer, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { users } from './users'

export const courseEnrollments = pgTable(
  'course_enrollments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    courseId: integer('course_id').notNull(), // Payload course ID
    enrolledAt: timestamp('enrolled_at').defaultNow().notNull(),
    completedAt: timestamp('completed_at'), // nullable — set when all lessons completed
  },
  (table) => [uniqueIndex('course_enrollments_user_course_idx').on(table.userId, table.courseId)]
)

export type CourseEnrollment = typeof courseEnrollments.$inferSelect
export type NewCourseEnrollment = typeof courseEnrollments.$inferInsert
