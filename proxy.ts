import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require an active Pro (or higher) subscription
const PRO_ROUTES: string[] = []

// Routes that only unauthenticated users should access (redirect to /feed if logged in)
const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password']

// Landing page — logged-in users go to feed
const LANDING_ROUTE = '/'

// Verify email page — needs special handling
const VERIFY_ROUTE = '/verify-email'

export default auth(async function proxy(
  req: NextRequest & {
    auth: {
      user?: {
        role?: string
        isEmailVerified?: boolean
        subscriptionExpiry?: string | null
      }
    } | null
  }
) {
  const { pathname } = req.nextUrl
  const session = req.auth

  // ── Landing page: redirect logged-in users to feed, allow guests ───
  if (pathname === LANDING_ROUTE) {
    if (session?.user) {
      return NextResponse.redirect(new URL('/feed', req.url))
    }
    return NextResponse.next()
  }

  // ── Auth pages: redirect logged-in users to feed ──────────────────
  if (AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    if (session?.user) {
      return NextResponse.redirect(new URL('/feed', req.url))
    }
    return NextResponse.next()
  }

  // ── Verify email page: allow both authed and unauthed ─────────────
  if (pathname.startsWith(VERIFY_ROUTE)) {
    return NextResponse.next()
  }

  // ── Protected routes: require authentication ──────────────────────
  if (!session?.user) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ── Blocked user gate ─────────────────────────────────────────────
  if ((session.user as Record<string, unknown>).blocked) {
    // Sign out handled client-side; redirect to login with blocked message
    const blockedUrl = new URL('/login', req.url)
    blockedUrl.searchParams.set('error', 'blocked')
    return NextResponse.redirect(blockedUrl)
  }

  // ── Email verification gate ───────────────────────────────────────
  if (!session.user.isEmailVerified) {
    return NextResponse.redirect(new URL('/verify-email', req.url))
  }

  // ── Pro-gated routes ──────────────────────────────────────────────
  const role = session.user.role ?? 'free'
  const subscriptionExpiry = session.user.subscriptionExpiry
  const isProExpired =
    role === 'pro' && subscriptionExpiry && new Date(subscriptionExpiry) < new Date()
  const effectiveRole = isProExpired ? 'free' : role

  const isProRoute = PRO_ROUTES.some((route) => pathname.startsWith(route))
  if (
    isProRoute &&
    effectiveRole !== 'pro' &&
    effectiveRole !== 'analyst' &&
    effectiveRole !== 'admin'
  ) {
    const upgradeUrl = new URL('/upgrade', req.url)
    upgradeUrl.searchParams.set('source', 'proxy')
    return NextResponse.redirect(upgradeUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Landing page (redirect to feed if logged in)
    '/',
    // Auth pages (redirect if already logged in)
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    // Protected dashboard routes
    '/feed(.*)',
    '/articles(.*)',
    '/settings(.*)',
    '/tools(.*)',
    '/community(.*)',
    '/saved(.*)',
    '/upgrade(.*)',
  ],
}
