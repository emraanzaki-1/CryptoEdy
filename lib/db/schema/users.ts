import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  pgEnum,
  AnyPgColumn,
} from 'drizzle-orm/pg-core'

export const roleEnum = pgEnum('role', ['free', 'pro', 'analyst', 'admin'])

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: text('password_hash'), // nullable — null if wallet-only auth
  role: roleEnum('role').default('free').notNull(),
  subscriptionExpiry: timestamp('subscription_expiry'), // null for non-pro users
  emailVerified: boolean('email_verified').default(false).notNull(),
  verificationToken: text('verification_token'), // cleared after verification
  verificationTokenExpiry: timestamp('verification_token_expiry'),
  resetPasswordToken: text('reset_password_token'),
  resetPasswordTokenExpiry: timestamp('reset_password_token_expiry'),
  referralCode: varchar('referral_code', { length: 16 }).unique(), // generated on registration
  referredBy: uuid('referred_by').references((): AnyPgColumn => users.id), // self-reference
  // Profile fields (Sprint 12)
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  username: varchar('username', { length: 50 }).unique(),
  displayName: varchar('display_name', { length: 100 }),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  blocked: boolean('blocked').default(false).notNull(),
  themePreference: varchar('theme_preference', { length: 10 }), // 'light' | 'dark' | 'system' | null
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
