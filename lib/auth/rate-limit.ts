import { NextResponse } from 'next/server'

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Periodically evict expired entries to prevent memory leak
const CLEANUP_INTERVAL = 60_000 // 1 minute
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key)
    }
  }
}, CLEANUP_INTERVAL).unref?.()

interface RateLimitOptions {
  /** Maximum requests allowed within the window */
  maxRequests: number
  /** Window duration in seconds */
  windowSec: number
}

function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() ?? 'unknown'
}

/**
 * In-memory fixed-window rate limiter keyed by IP + route path.
 *
 * ⚠️  In-memory: resets on restart, not shared across instances.
 *     For production multi-instance deployments, swap to Redis-backed
 *     implementation (e.g. @upstash/ratelimit).
 *
 * Returns null if under limit, or a 429 NextResponse if exceeded.
 */
export function rateLimit(
  request: Request,
  { maxRequests, windowSec }: RateLimitOptions
): NextResponse | null {
  const ip = getClientIp(request)
  const url = new URL(request.url)
  const key = `${ip}:${url.pathname}`
  const now = Date.now()
  const windowMs = windowSec * 1000

  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return null
  }

  entry.count++

  if (entry.count > maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(retryAfter) },
      }
    )
  }

  return null
}
