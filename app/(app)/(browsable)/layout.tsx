import { cookies } from 'next/headers'
import { auth } from '@/lib/auth'
import { DashboardShell } from '@/components/layouts/dashboard-shell'
import { GuestShell } from '@/components/layouts/guest-shell'
import { AvatarProvider } from '@/components/providers/avatar-provider'
import { getNavCategories } from '@/lib/categories/getCategories'
import { LAYOUT } from '@/lib/config/layout'

export default async function BrowsableLayout({ children }: { children: React.ReactNode }) {
  // Check for session cookie without calling auth() — avoids cache-control:no-store
  // on guest pages, enabling bfcache for back/forward navigation.
  // Security gating is handled by proxy.ts; this is only a UI layout decision.
  const cookieStore = await cookies()
  const hasSession =
    cookieStore.has('authjs.session-token') || cookieStore.has('__Secure-authjs.session-token')

  const navCategories = await getNavCategories()

  // Guest — show GuestShell (landing-style nav with Sign In / Join Now)
  if (!hasSession) {
    return (
      <GuestShell navCategories={navCategories}>
        <div className={`${LAYOUT.guest.container} ${LAYOUT.guest.pagePy}`}>{children}</div>
      </GuestShell>
    )
  }

  // Authenticated — call auth() only in the dashboard branch (bfcache less critical here)
  const session = await auth()
  if (!session?.user) {
    // Cookie exists but session is invalid (expired/corrupted) — fall back to guest
    return (
      <GuestShell navCategories={navCategories}>
        <div className={`${LAYOUT.guest.container} ${LAYOUT.guest.pagePy}`}>{children}</div>
      </GuestShell>
    )
  }

  const role = session.user.role ?? 'free'
  const subscriptionExpiry = (session.user as { subscriptionExpiry?: string | null })
    .subscriptionExpiry
  const isProExpired =
    role === 'pro' && subscriptionExpiry && new Date(subscriptionExpiry) < new Date()
  const isPro = !isProExpired && (role === 'pro' || role === 'analyst' || role === 'admin')

  return (
    <AvatarProvider initialUrl={session.user.image ?? null}>
      <DashboardShell
        user={{
          name: session.user.name ?? session.user.email?.split('@')[0] ?? 'User',
          email: session.user.email ?? undefined,
          image: session.user.image ?? undefined,
          isPro,
        }}
        navCategories={navCategories}
      >
        {children}
      </DashboardShell>
    </AvatarProvider>
  )
}
