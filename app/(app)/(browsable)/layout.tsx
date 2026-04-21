import { auth } from '@/lib/auth'
import { DashboardShell } from '@/components/layouts/dashboard-shell'
import { GuestShell } from '@/components/layouts/guest-shell'
import { AvatarProvider } from '@/components/providers/avatar-provider'
import { getNavCategories } from '@/lib/categories/getCategories'
import { LAYOUT } from '@/lib/config/layout'

export default async function BrowsableLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const navCategories = await getNavCategories()

  // Guest — show GuestShell (landing-style nav with Sign In / Join Now)
  if (!session?.user) {
    return (
      <GuestShell>
        <div className={`${LAYOUT.guest.container} ${LAYOUT.guest.pagePy}`}>{children}</div>
      </GuestShell>
    )
  }

  // Authenticated — show DashboardShell (sidebar + top bar)
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
