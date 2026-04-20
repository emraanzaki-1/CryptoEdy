import { pgTable, uuid, integer, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { users } from './users'

export const lessonProgress = pgTable(
  'lesson_progress',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    lessonId: integer('lesson_id').notNull(), // Payload lesson ID
    courseId: integer('course_id').notNull(), // Payload course ID (denormalized for fast queries)
    completedAt: timestamp('completed_at').defaultNow().notNull(),
  },
  (table) => [uniqueIndex('lesson_progress_user_lesson_idx').on(table.userId, table.lessonId)]
)

export type LessonProgress = typeof lessonProgress.$inferSelect
export type NewLessonProgress = typeof lessonProgress.$inferInsert
