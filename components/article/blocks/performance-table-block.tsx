import { cn } from '@/lib/utils'

const STATUS_STYLES = {
  open: { label: 'Open', className: 'bg-primary/10 text-primary' },
  closed: { label: 'Closed', className: 'bg-secondary/10 text-secondary' },
  stopped: { label: 'Stopped', className: 'bg-error/10 text-error' },
} as const

interface PerformanceRow {
  token: string
  entryPrice: string
  exitPrice: string
  gain: string
  status?: keyof typeof STATUS_STYLES | null
  pickedAt: string
  id?: string
}

interface PerformanceTableBlockProps {
  title?: string | null
  rows: PerformanceRow[]
  footnote?: string | null
}

export function PerformanceTableBlockComponent({
  title = 'Track Record',
  rows,
  footnote,
}: PerformanceTableBlockProps) {
  return (
    <div className="border-outline-variant/15 bg-surface-container-lowest my-8 overflow-hidden rounded-2xl border shadow-[0_8px_32px_-8px_rgba(11,28,48,0.06)]">
      {title && (
        <div className="bg-surface-container-low/50 px-6 py-4">
          <h4 className="text-on-background text-sm font-bold tracking-[0.05em] uppercase">
            {title}
          </h4>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-outline-variant/10 border-b">
              <th className="text-on-surface-variant px-6 py-3 text-xs font-bold tracking-[0.05em] uppercase">
                Token
              </th>
              <th className="text-on-surface-variant px-6 py-3 text-xs font-bold tracking-[0.05em] uppercase">
                Entry
              </th>
              <th className="text-on-surface-variant px-6 py-3 text-xs font-bold tracking-[0.05em] uppercase">
                Exit
              </th>
              <th className="text-on-surface-variant px-6 py-3 text-xs font-bold tracking-[0.05em] uppercase">
                Gain
              </th>
              <th className="text-on-surface-variant px-6 py-3 text-xs font-bold tracking-[0.05em] uppercase">
                Status
              </th>
              <th className="text-on-surface-variant px-6 py-3 text-xs font-bold tracking-[0.05em] uppercase">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const gainIsPositive = row.gain.startsWith('+')
              const status = STATUS_STYLES[row.status ?? 'closed'] ?? STATUS_STYLES.closed

              return (
                <tr
                  key={row.id ?? i}
                  className="border-outline-variant/10 border-b last:border-b-0"
                >
                  <td className="text-on-background px-6 py-3 font-bold">{row.token}</td>
                  <td className="text-on-surface-variant px-6 py-3">{row.entryPrice}</td>
                  <td className="text-on-surface-variant px-6 py-3">{row.exitPrice}</td>
                  <td
                    className={cn(
                      'px-6 py-3 font-bold',
                      gainIsPositive ? 'text-secondary' : 'text-error'
                    )}
                  >
                    {row.gain}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={cn(
                        'inline-block rounded-full px-2.5 py-0.5 text-xs font-bold',
                        status.className
                      )}
                    >
                      {status.label}
                    </span>
                  </td>
                  <td className="text-on-surface-variant px-6 py-3 text-xs">
                    {new Date(row.pickedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {footnote && (
        <div className="border-outline-variant/10 border-t px-6 py-3">
          <p className="text-on-surface-variant text-xs italic">{footnote}</p>
        </div>
      )}
    </div>
  )
}
