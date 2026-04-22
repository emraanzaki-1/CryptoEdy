import { ExternalLink } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface PaymentEntry {
  date: string
  chain: string
  asset: string
  amount: string
  status: 'Confirmed' | 'Pending' | 'Failed'
  txHash: string
  explorerUrl: string
}

interface BillingHistoryTableProps {
  entries: PaymentEntry[]
}

const STATUS_STYLES = {
  Confirmed: 'bg-secondary-container/20 text-secondary',
  Pending: 'bg-tertiary-container/20 text-tertiary',
  Failed: 'bg-error-container/20 text-error',
} as const

function truncateHash(hash: string): string {
  if (hash.length <= 13) return hash
  return `${hash.slice(0, 6)}…${hash.slice(-4)}`
}

export function BillingHistoryTable({ entries }: BillingHistoryTableProps) {
  if (entries.length === 0) {
    return (
      <Card variant="surface" className="p-8 text-center">
        <p className="text-on-surface-variant text-body-sm">
          No transactions yet. Your payment history will appear here after your first subscription.
        </p>
      </Card>
    )
  }

  return (
    <Card variant="surface">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-outline-variant/15 bg-surface-container-lowest/50 border-b">
              <th className="text-on-surface text-overline px-6 py-4 font-bold uppercase">Date</th>
              <th className="text-on-surface text-overline px-6 py-4 font-bold uppercase">Chain</th>
              <th className="text-on-surface text-overline px-6 py-4 font-bold uppercase">Asset</th>
              <th className="text-on-surface text-overline px-6 py-4 font-bold uppercase">
                Amount
              </th>
              <th className="text-on-surface text-overline px-6 py-4 font-bold uppercase">
                Status
              </th>
              <th className="text-on-surface text-overline px-6 py-4 text-right font-bold uppercase">
                Tx Hash
              </th>
            </tr>
          </thead>
          <tbody className="divide-outline-variant/15 divide-y">
            {entries.map((entry) => (
              <tr
                key={entry.txHash}
                className="hover:bg-surface-container-lowest/50 transition-colors"
              >
                <td className="text-on-surface text-body-sm px-6 py-4">{entry.date}</td>
                <td className="text-on-surface text-body-sm px-6 py-4 font-medium">
                  {entry.chain}
                </td>
                <td className="text-on-surface text-body-sm px-6 py-4">{entry.asset}</td>
                <td className="text-on-surface text-body-sm px-6 py-4 font-medium">
                  {entry.amount}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`text-micro inline-flex items-center rounded-full px-2.5 py-0.5 font-medium ${STATUS_STYLES[entry.status]}`}
                  >
                    {entry.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <a
                    href={entry.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 text-body-sm inline-flex items-center gap-1.5 font-mono transition-colors"
                  >
                    {truncateHash(entry.txHash)}
                    <ExternalLink className="size-3.5" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
