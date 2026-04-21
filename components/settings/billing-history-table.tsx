import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface BillingEntry {
  date: string
  amount: string
  status: 'Paid' | 'Pending' | 'Failed'
}

interface BillingHistoryTableProps {
  entries: BillingEntry[]
}

export function BillingHistoryTable({ entries }: BillingHistoryTableProps) {
  return (
    <Card variant="surface">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-outline-variant/15 bg-surface-container-lowest/50 border-b">
            <th className="text-on-surface px-6 py-4 text-xs font-bold tracking-[0.05em] uppercase">
              Date
            </th>
            <th className="text-on-surface px-6 py-4 text-xs font-bold tracking-[0.05em] uppercase">
              Amount
            </th>
            <th className="text-on-surface px-6 py-4 text-xs font-bold tracking-[0.05em] uppercase">
              Status
            </th>
            <th className="text-on-surface px-6 py-4 text-right text-xs font-bold tracking-[0.05em] uppercase">
              Invoice
            </th>
          </tr>
        </thead>
        <tbody className="divide-outline-variant/15 divide-y">
          {entries.map((entry) => (
            <tr key={entry.date} className="hover:bg-surface-container-lowest/50 transition-colors">
              <td className="text-on-surface px-6 py-4 text-sm">{entry.date}</td>
              <td className="text-on-surface px-6 py-4 text-sm font-medium">{entry.amount}</td>
              <td className="px-6 py-4">
                <span className="bg-secondary-container/20 text-secondary inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                  {entry.status}
                </span>
              </td>
              <td className="px-6 py-4 text-right text-sm">
                <Button
                  variant="link"
                  size="sm"
                  className="text-primary hover:text-primary-container"
                >
                  <Download className="size-[18px]" />
                  PDF
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}
