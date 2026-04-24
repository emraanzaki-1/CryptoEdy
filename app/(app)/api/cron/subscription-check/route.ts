import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq, and, isNotNull } from 'drizzle-orm'
import { onSubscriptionExpired, onSubscriptionExpiring } from '@/lib/notifications/events'
import { timingSafeEqual } from 'crypto'

// In-memory guard: prevents duplicate warning notifications if cron fires twice in quick succession
let lastRunDate = ''

/**
 * Subscription expiry cron job.
 * Runs daily — downgrades expired Pro users and sends warning notifications.
 * Protected by CRON_SECRET bearer token.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || !authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const expected = Buffer.from(`Bearer ${cronSecret}`)
  const actual = Buffer.from(authHeader)
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = getDb()
  const now = new Date()
  const todayKey = now.toISOString().slice(0, 10) // YYYY-MM-DD

  // Skip warning notifications if cron already ran today (downgrades still run — they're idempotent)
  const alreadyRanToday = lastRunDate === todayKey
  lastRunDate = todayKey

  // Fetch all Pro users with a subscription expiry set
  const proUsers = await db
    .select({
      id: users.id,
      subscriptionExpiry: users.subscriptionExpiry,
    })
    .from(users)
    .where(and(eq(users.role, 'pro'), isNotNull(users.subscriptionExpiry)))

  let expired = 0
  let warned = 0
  const expiredIds: string[] = []

  for (const user of proUsers) {
    if (!user.subscriptionExpiry) continue

    const diffMs = user.subscriptionExpiry.getTime() - now.getTime()
    const daysUntilExpiry = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    if (daysUntilExpiry <= 0) {
      expiredIds.push(user.id)
      expired++
    } else if (!alreadyRanToday && [1, 7, 14, 30].includes(daysUntilExpiry)) {
      try {
        await onSubscriptionExpiring(user.id, daysUntilExpiry)
        warned++
      } catch (err) {
        console.error(`[cron] Failed to send expiry warning to ${user.id}:`, err)
      }
    }
  }

  // Batch downgrade expired users
  if (expiredIds.length > 0) {
    const { inArray } = await import('drizzle-orm')
    await db
      .update(users)
      .set({ role: 'free', updatedAt: now })
      .where(inArray(users.id, expiredIds))

    // Fire notifications for each expired user
    for (const userId of expiredIds) {
      try {
        await onSubscriptionExpired(userId)
      } catch (err) {
        console.error(`[cron] Failed to send expiry notification to ${userId}:`, err)
      }
    }
  }

  return NextResponse.json({
    checked: proUsers.length,
    expired,
    warned,
    timestamp: now.toISOString(),
  })
}
