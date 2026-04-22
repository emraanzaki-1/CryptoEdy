import { BillingHistoryTable } from '@/components/settings/billing-history-table'
import { SectionHeading } from '@/components/common/section-heading'
import { ButtonLink } from '@/components/ui/button-link'
import { Card } from '@/components/ui/card'
import { Title } from '@/components/ui/typography'
import { auth } from '@/lib/auth'
import { getDb } from '@/lib/db'
import { payments } from '@/lib/db/schema/payments'
import { eq, desc } from 'drizzle-orm'
import { getExplorerUrl } from '@/lib/payments/explorers'
import { redirect } from 'next/navigation'

export default async function BillingSettingsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { role, subscriptionExpiry } = session.user as {
    role: string
    subscriptionExpiry: string | null
  }
  const userId = session.user.id!

  const db = getDb()
  const userPayments = await db
    .select()
    .from(payments)
    .where(eq(payments.userId, userId))
    .orderBy(desc(payments.createdAt))

  const paymentEntries = userPayments.map((p) => ({
    date: new Date(p.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    chain: p.chain,
    asset: p.asset,
    amount: `$${Number(p.amount).toFixed(2)}`,
    status: (p.status.charAt(0).toUpperCase() + p.status.slice(1)) as
      | 'Confirmed'
      | 'Pending'
      | 'Failed',
    txHash: p.txHash,
    explorerUrl: getExplorerUrl(p.chain, p.txHash),
  }))

  const isPro = role === 'pro'
  const expiryDate = subscriptionExpiry ? new Date(subscriptionExpiry) : null
  const isExpired = expiryDate ? expiryDate < new Date() : false
  const isActive = isPro && !isExpired

  const statusBadge = isActive
    ? { label: 'Active', className: 'bg-secondary-container/20 text-secondary' }
    : isExpired
      ? { label: 'Expired', className: 'bg-error-container/20 text-error' }
      : { label: 'Free', className: 'bg-outline-variant/20 text-on-surface-variant' }

  return (
    <>
      <SectionHeading as="h2" subtitle="Manage your subscription and view transaction history.">
        Billing
      </SectionHeading>

      <div className="space-y-10">
        {/* Current Plan */}
        <section>
          <SectionHeading variant="subsection">Current Plan</SectionHeading>
          <Card
            variant="surface"
            className="flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center"
          >
            <div>
              <div className="mb-1 flex items-center gap-3">
                <Title as="h4">{isActive ? 'Pro Annual' : 'Free'}</Title>
                <span
                  className={`text-micro rounded-md px-2.5 py-1 font-bold ${statusBadge.className}`}
                >
                  {statusBadge.label}
                </span>
              </div>
              <p className="text-on-surface-variant text-body-sm">
                {isActive && expiryDate
                  ? `Your Pro membership expires on ${expiryDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.`
                  : isExpired && expiryDate
                    ? `Your membership expired on ${expiryDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}. Renew to regain access.`
                    : 'Upgrade to Pro for full access to research, courses, and tools.'}
              </p>
            </div>
            <ButtonLink
              href="/settings/plans"
              variant="tonal"
              size="lg"
              className="text-on-surface hover:bg-outline-variant/20 rounded-full px-5 font-semibold hover:translate-y-0"
            >
              {isActive ? 'Renew' : 'Upgrade'}
            </ButtonLink>
          </Card>
        </section>

        {/* Connected Wallets */}
        <section>
          <SectionHeading variant="subsection">Connected Wallets</SectionHeading>
          <Card variant="surface" className="p-6">
            <p className="text-on-surface-variant text-body-sm">
              No wallets connected yet. Connect a wallet when upgrading to Pro.
            </p>
          </Card>
        </section>

        {/* Transaction History */}
        <section>
          <SectionHeading variant="subsection">Transaction History</SectionHeading>
          <BillingHistoryTable entries={paymentEntries} />
        </section>
      </div>
    </>
  )
}
