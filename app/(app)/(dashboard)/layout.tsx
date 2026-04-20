import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DashboardShell } from '@/components/layouts/dashboard-shell'
import { AvatarProvider } from '@/components/providers/avatar-provider'
import { getNavCategories } from '@/lib/categories/getCategories'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const role = session.user.role ?? 'free'
  const subscriptionExpiry = (session.user as { subscriptionExpiry?: string | null })
    .subscriptionExpiry
  const isProExpired =
    role === 'pro' && subscriptionExpiry && new Date(subscriptionExpiry) < new Date()
  const isPro = !isProExpired && (role === 'pro' || role === 'analyst' || role === 'admin')

  const navCategories = await getNavCategories()

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
