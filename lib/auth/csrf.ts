import { NextResponse } from 'next/server'

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
  if (!appUrl) return null // Can't validate without a configured URL

  try {
    const appOrigin = new URL(appUrl).origin
    if (origin === appOrigin) return null
  } catch {
    return null
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
