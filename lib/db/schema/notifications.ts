import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core'
import { users } from './users'

export const notificationTypeEnum = pgEnum('notification_type', [
  'content',
  'community',
  'feed',
  'account',
])

export const notificationSubtypeEnum = pgEnum('notification_subtype', [
  'research',
  'analysis',
  'message',
  'mention',
  'reply',
  'market_direction',
  'picks',
  'advertising',
  'subscription',
  'referral',
])

export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    type: notificationTypeEnum('type').notNull(),
    subtype: notificationSubtypeEnum('subtype').notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    body: text('body').notNull(),
    link: text('link'),
    isRead: boolean('is_read').default(false).notNull(),
    actorId: uuid('actor_id').references(() => users.id, { onDelete: 'set null' }),
    actorAvatar: text('actor_avatar'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('notifications_user_read_idx').on(table.userId, table.isRead),
    index('notifications_user_created_idx').on(table.userId, table.createdAt),
    index('notifications_user_type_read_idx').on(table.userId, table.type, table.isRead),
  ]
)

export type Notification = typeof notifications.$inferSelect
export type NewNotification = typeof notifications.$inferInsert
export type NotificationType = (typeof notificationTypeEnum.enumValues)[number]
export type NotificationSubtype = (typeof notificationSubtypeEnum.enumValues)[number]
