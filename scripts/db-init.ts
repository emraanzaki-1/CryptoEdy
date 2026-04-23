/**
 * Initialise Payload CMS tables in the database.
 *
 * Boots Payload (which auto-creates missing tables in the configured schema),
 * then exits. Run once on a fresh server before `npm run build`.
 *
 * Usage: npm run db:init
 */
import { getPayload } from 'payload'
import config from '../payload.config'

async function main() {
  console.log('[db:init] Booting Payload to initialise database tables...')
  const payload = await getPayload({ config })
  console.log('[db:init] Payload initialised — all tables created.')
  process.exit(0)
}

main().catch((err) => {
  console.error('[db:init] Error:', err)
  process.exit(1)
})
