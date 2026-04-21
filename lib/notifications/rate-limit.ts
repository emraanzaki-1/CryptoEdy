/**
 * In-memory email rate limiter for notifications.
 * Prevents sending more than 1 email per user per hour per subtype.
 * Matches the in-memory pattern used in lib/auth/rate-limit.ts.
 *
 * For production multi-instance deployments, swap to Redis/Upstash.
 */

const WINDOW_MS = 60 * 60 * 1000 // 1 hour

/** Map key: `${userId}:${subtype}`, value: timestamp of last sent email. */
const lastSent = new Map<string, number>()

/** Periodically clean up expired entries to avoid memory leaks. */
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000 // 10 minutes
setInterval(() => {
  const cutoff = Date.now() - WINDOW_MS
  for (const [key, ts] of lastSent) {
    if (ts < cutoff) lastSent.delete(key)
  }
}, CLEANUP_INTERVAL_MS).unref()

/**
 * Check if an email can be sent. Returns true if allowed.
 * Automatically records the send if allowed.
 */
export function canSendEmail(userId: string, subtype: string): boolean {
  const key = `${userId}:${subtype}`
  const last = lastSent.get(key)

  if (last && Date.now() - last < WINDOW_MS) {
    return false
  }

  lastSent.set(key, Date.now())
  return true
}
