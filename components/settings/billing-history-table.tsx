import { Download } from 'lucide-react'

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
    <div className="border-outline-variant/15 bg-surface-container-low overflow-hidden rounded-2xl border">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-outline-variant/15 bg-surface-container-lowest/50 border-b">
            <th className="text-on-surface px-6 py-4 text-xs font-bold tracking-wider uppercase">
              Date
            </th>
            <th className="text-on-surface px-6 py-4 text-xs font-bold tracking-wider uppercase">
              Amount
            </th>
            <th className="text-on-surface px-6 py-4 text-xs font-bold tracking-wider uppercase">
              Status
            </th>
            <th className="text-on-surface px-6 py-4 text-right text-xs font-bold tracking-wider uppercase">
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
                <button className="text-primary hover:text-primary-container inline-flex items-center gap-1 font-medium transition-colors">
                  <Download className="size-[18px]" />
                  PDF
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
