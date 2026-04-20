import { pgTable, uuid, integer, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { users } from './users'

export const bookmarks = pgTable(
  'bookmarks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    postId: integer('post_id').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [uniqueIndex('bookmarks_user_post_idx').on(table.userId, table.postId)]
)

export type Bookmark = typeof bookmarks.$inferSelect
export type NewBookmark = typeof bookmarks.$inferInsert
