import { BillingHistoryTable } from '@/components/settings/billing-history-table'

const billingHistory = [
  { date: 'Oct 15, 2023', amount: '$299.00', status: 'Paid' as const },
  { date: 'Oct 15, 2022', amount: '$299.00', status: 'Paid' as const },
]

export default function BillingSettingsPage() {
  return (
    <>
      <div>
        <h2 className="font-headline text-on-surface mb-2 text-[2.5rem] leading-tight font-bold tracking-[-0.04em]">
          Billing
        </h2>
        <p className="text-on-surface-variant text-base">
          Manage your billing information and view past invoices.
        </p>
      </div>

      <div className="space-y-10">
        {/* Current Plan */}
        <section>
          <h3 className="text-on-surface mb-5 text-base font-semibold">Current Plan</h3>
          <div className="border-outline-variant/15 bg-surface-container-low flex flex-col items-start justify-between gap-4 rounded-2xl border p-6 sm:flex-row sm:items-center">
            <div>
              <div className="mb-1 flex items-center gap-3">
                <h4 className="text-on-surface text-xl font-bold">Pro Annual</h4>
                <span className="bg-secondary-container/20 text-secondary rounded-md px-2.5 py-1 text-xs font-bold">
                  Active
                </span>
              </div>
              <p className="text-on-surface-variant text-sm">
                Your next billing date is <strong>Oct 15, 2024</strong> for $299.00.
              </p>
            </div>
            <button className="bg-surface-container-high text-on-surface hover:bg-outline-variant/20 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors">
              Change plan
            </button>
          </div>
        </section>

        {/* Payment Method */}
        <section>
          <h3 className="text-on-surface mb-5 text-base font-semibold">Payment Method</h3>
          <div className="border-outline-variant/15 bg-surface-container-low flex flex-col items-start justify-between gap-4 rounded-2xl border p-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <div className="border-outline-variant/15 bg-surface-container-highest flex h-8 w-12 items-center justify-center rounded border">
                <span className="text-primary text-xs font-bold">VISA</span>
              </div>
              <div>
                <p className="text-on-surface text-base font-medium">Visa ending in 4242</p>
                <p className="text-on-surface-variant text-sm">Expires 12/2025</p>
              </div>
            </div>
            <button className="bg-surface-container-high text-on-surface hover:bg-outline-variant/20 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors">
              Update
            </button>
          </div>
        </section>

        {/* Billing History */}
        <section>
          <h3 className="text-on-surface mb-5 text-base font-semibold">Billing History</h3>
          <BillingHistoryTable entries={billingHistory} />
        </section>
      </div>
    </>
  )
}
