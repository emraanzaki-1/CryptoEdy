import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DashboardShell } from '@/components/layouts/dashboard-shell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const role = session.user.role ?? 'free'
  const subscriptionExpiry = (session.user as { subscriptionExpiry?: string | null })
    .subscriptionExpiry
  const isProExpired =
    role === 'pro' && subscriptionExpiry && new Date(subscriptionExpiry) < new Date()
  const isPro = !isProExpired && (role === 'pro' || role === 'analyst' || role === 'admin')

  return (
    <DashboardShell
      user={{
        name: session.user.name ?? session.user.email?.split('@')[0] ?? 'User',
        image: session.user.image ?? undefined,
        isPro,
      }}
    >
      {children}
    </DashboardShell>
  )
}
