import { pgTable, uuid, boolean, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { users } from './users'
import { notificationTypeEnum, notificationSubtypeEnum } from './notifications'

export const notificationPreferences = pgTable(
  'notification_preferences',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    type: notificationTypeEnum('type').notNull(),
    subtype: notificationSubtypeEnum('subtype').notNull(),
    inApp: boolean('in_app').default(true).notNull(),
    email: boolean('email').default(true).notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('notification_preferences_user_type_subtype_idx').on(
      table.userId,
      table.type,
      table.subtype
    ),
  ]
)

export type NotificationPreferences = typeof notificationPreferences.$inferSelect
export type NewNotificationPreferences = typeof notificationPreferences.$inferInsert
