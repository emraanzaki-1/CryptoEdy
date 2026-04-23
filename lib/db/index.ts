import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

type DB = NodePgDatabase<typeof schema>

// Lazy singleton — only connects when first accessed, not at module evaluation time.
// This allows the build to succeed without DATABASE_URL being set.
let _pool: Pool | null = null
let _db: DB | null = null

function ensurePool(): Pool {
  if (!_pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error('[CryptoEdy] DATABASE_URL is not set. Check your .env.local file.')
    }
    _pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    })
  }
  return _pool
}

// Graceful shutdown — drain pool on process exit
function handleShutdown() {
  if (_pool) {
    _pool.end().catch((err) => console.error('[CryptoEdy] Pool shutdown error:', err))
  }
}
process.on('SIGTERM', handleShutdown)
process.on('SIGINT', handleShutdown)

export function getDb(): DB {
  if (!_db) {
    _db = drizzle(ensurePool(), { schema })
  }
  return _db
}

/** Raw pg Pool for queries that bypass Drizzle ORM (e.g. full-text search on Payload tables). */
export function getPool(): Pool {
  return ensurePool()
}

/** Use this in all server-side code (API routes, Server Components, middleware) */
export const db = { get: getDb }

export type Database = DB
