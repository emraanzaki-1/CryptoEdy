import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

type DB = NodePgDatabase<typeof schema>

// Lazy singleton — only connects when first accessed, not at module evaluation time.
// This allows the build to succeed without DATABASE_URL being set.
let _db: DB | null = null

export function getDb(): DB {
  if (!_db) {
    if (!process.env.DATABASE_URL) {
      throw new Error('[CryptoEdy] DATABASE_URL is not set. Check your .env.local file.')
    }
    const pool = new Pool({ connectionString: process.env.DATABASE_URL })
    _db = drizzle(pool, { schema })
  }
  return _db
}

/** Use this in all server-side code (API routes, Server Components, middleware) */
export const db = { get: getDb }

export type Database = DB
