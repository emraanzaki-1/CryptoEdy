import { NextResponse } from 'next/server'

const isProduction = process.env.NODE_ENV === 'production'

/**
 * CSRF protection via Origin header check.
 * Returns a 403 response if the request origin doesn't match the app URL.
 * Returns null if the request is safe to proceed.
 *
 * Skip for:
 * - Requests with no Origin header (non-browser clients like cURL, webhooks)
 * - GET/HEAD/OPTIONS requests (safe methods)
 */
export function checkCsrf(request: Request): NextResponse | null {
  const method = request.method.toUpperCase()
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) return null

  const origin = request.headers.get('origin')
  if (!origin) return null // Non-browser client (webhook, cURL, server-to-server)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? ''
  if (!appUrl) {
    // In production, fail closed — reject the request if we can't validate the origin
    if (isProduction) {
      console.error('[csrf] NEXT_PUBLIC_APP_URL / NEXTAUTH_URL not set — rejecting request')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return null // Development: allow through
  }

  try {
    const appOrigin = new URL(appUrl).origin
    if (origin === appOrigin) return null
  } catch {
    if (isProduction) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return null
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
