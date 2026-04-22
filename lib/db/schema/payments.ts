import {
  pgTable,
  uuid,
  varchar,
  text,
  numeric,
  timestamp,
  pgEnum,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { users } from './users'

export const paymentStatusEnum = pgEnum('payment_status', ['confirmed', 'pending', 'failed'])

export const payments = pgTable(
  'payments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    txHash: varchar('tx_hash', { length: 255 }).unique().notNull(),
    chain: varchar('chain', { length: 50 }).notNull(),
    asset: varchar('asset', { length: 10 }).notNull(),
    amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
    status: paymentStatusEnum('status').notNull(),
    provider: varchar('provider', { length: 50 }).default('thirdweb').notNull(),
    providerPaymentId: varchar('provider_payment_id', { length: 255 }),
    walletAddress: varchar('wallet_address', { length: 255 }),
    recipientAddress: varchar('recipient_address', { length: 255 }),
    statusReason: text('status_reason'),
    adminNote: text('admin_note'),
    confirmedAt: timestamp('confirmed_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('payments_user_id_idx').on(table.userId),
    index('payments_status_idx').on(table.status),
    index('payments_chain_idx').on(table.chain),
    index('payments_created_at_idx').on(table.createdAt),
    uniqueIndex('payments_provider_payment_id_idx').on(table.provider, table.providerPaymentId),
  ]
)

export type Payment = typeof payments.$inferSelect
export type NewPayment = typeof payments.$inferInsert
