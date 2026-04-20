import { pgTable, uuid, boolean, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { users } from './users'

export const notificationPreferences = pgTable(
  'notification_preferences',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    dailyBrief: boolean('daily_brief').default(true).notNull(),
    proAlerts: boolean('pro_alerts').default(true).notNull(),
    marketDirection: boolean('market_direction').default(true).notNull(),
    assetsPicks: boolean('assets_picks').default(true).notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [uniqueIndex('notification_preferences_user_id_idx').on(table.userId)]
)

export type NotificationPreferences = typeof notificationPreferences.$inferSelect
export type NewNotificationPreferences = typeof notificationPreferences.$inferInsert
