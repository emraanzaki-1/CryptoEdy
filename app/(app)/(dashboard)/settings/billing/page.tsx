import { BillingHistoryTable } from '@/components/settings/billing-history-table'
import { SectionHeading } from '@/components/common/section-heading'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Title } from '@/components/ui/typography'

const billingHistory = [
  { date: 'Oct 15, 2023', amount: '$299.00', status: 'Paid' as const },
  { date: 'Oct 15, 2022', amount: '$299.00', status: 'Paid' as const },
]

export default function BillingSettingsPage() {
  return (
    <>
      <SectionHeading as="h2" subtitle="Manage your billing information and view past invoices.">
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
                <Title as="h4">Pro Annual</Title>
                <span className="bg-secondary-container/20 text-secondary rounded-md px-2.5 py-1 text-xs font-bold">
                  Active
                </span>
              </div>
              <p className="text-on-surface-variant text-body-sm">
                Your next billing date is <strong>Oct 15, 2024</strong> for $299.00.
              </p>
            </div>
            <Button
              variant="tonal"
              size="lg"
              className="text-on-surface hover:bg-outline-variant/20 rounded-full px-5 font-semibold hover:translate-y-0"
            >
              Change plan
            </Button>
          </Card>
        </section>

        {/* Payment Method */}
        <section>
          <SectionHeading variant="subsection">Payment Method</SectionHeading>
          <Card
            variant="surface"
            className="flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center"
          >
            <div className="flex items-center gap-4">
              <div className="border-outline-variant/15 bg-surface-container-highest flex h-8 w-12 items-center justify-center rounded border">
                <span className="text-primary text-xs font-bold">VISA</span>
              </div>
              <div>
                <p className="text-on-surface text-body-lg font-medium">Visa ending in 4242</p>
                <p className="text-on-surface-variant text-body-sm">Expires 12/2025</p>
              </div>
            </div>
            <Button
              variant="tonal"
              size="lg"
              className="text-on-surface hover:bg-outline-variant/20 rounded-full px-5 font-semibold hover:translate-y-0"
            >
              Update
            </Button>
          </Card>
        </section>

        {/* Billing History */}
        <section>
          <SectionHeading variant="subsection">Billing History</SectionHeading>
          <BillingHistoryTable entries={billingHistory} />
        </section>
      </div>
    </>
  )
}
