import { Target, TrendingUp, ShieldAlert, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'

const RISK_STYLES = {
  low: { label: 'Low Risk', className: 'bg-secondary/10 text-secondary' },
  medium: { label: 'Medium Risk', className: 'bg-tertiary/10 text-tertiary' },
  high: { label: 'High Risk', className: 'bg-error/10 text-error' },
  speculative: { label: 'Speculative', className: 'bg-error/15 text-error' },
} as const

interface PriceTargetBlockProps {
  token: string
  tokenName?: string | null
  entryZone: string
  priceTarget: string
  stopLoss: string
  timeframe: string
  riskRating: keyof typeof RISK_STYLES
  catalysts?: { catalyst: string; id?: string }[] | null
  rationale?: string | null
}

export function PriceTargetBlockComponent({
  token,
  tokenName,
  entryZone,
  priceTarget,
  stopLoss,
  timeframe,
  riskRating,
  catalysts,
  rationale,
}: PriceTargetBlockProps) {
  const risk = RISK_STYLES[riskRating] ?? RISK_STYLES.medium

  return (
    <Card variant="surface-lowest" shadow="card" className="my-8">
      {/* Header */}
      <div className="bg-surface-container-low/50 flex items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-full">
            <Target className="size-5" />
          </div>
          <div>
            <h4 className="text-on-background text-subtitle font-bold">{token}</h4>
            {tokenName && <p className="text-on-surface-variant text-micro">{tokenName}</p>}
          </div>
        </div>
        <span className={cn('text-micro rounded-full px-3 py-1 font-bold', risk.className)}>
          {risk.label}
        </span>
      </div>

      {/* Metrics grid */}
      <div className="bg-outline-variant/10 grid grid-cols-2 gap-px sm:grid-cols-4">
        <MetricCell icon={TrendingUp} label="Entry Zone" value={entryZone} />
        <MetricCell icon={Target} label="Price Target" value={priceTarget} accent />
        <MetricCell icon={ShieldAlert} label="Stop Loss" value={stopLoss} />
        <MetricCell icon={Clock} label="Timeframe" value={timeframe} />
      </div>

      {/* Catalysts */}
      {catalysts && catalysts.length > 0 && (
        <div className="border-outline-variant/10 border-t px-6 py-4">
          <p className="text-on-surface-variant text-overline mb-2 font-bold uppercase">
            Key Catalysts
          </p>
          <ul className="space-y-1.5">
            {catalysts.map((c, i) => (
              <li
                key={c.id ?? i}
                className="text-on-surface-variant text-body-sm flex items-start gap-2"
              >
                <span className="bg-primary mt-1.5 size-1.5 shrink-0 rounded-full" />
                {c.catalyst}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Rationale */}
      {rationale && (
        <div className="border-outline-variant/10 border-t px-6 py-4">
          <p className="text-on-surface-variant text-body-sm">{rationale}</p>
        </div>
      )}
    </Card>
  )
}

function MetricCell({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div className="bg-surface-container-lowest flex flex-col gap-1 px-6 py-4">
      <div className="text-on-surface-variant text-micro flex items-center gap-1.5">
        <Icon className="size-3.5" />
        {label}
      </div>
      <p className={cn('text-body-sm font-bold', accent ? 'text-primary' : 'text-on-background')}>
        {value}
      </p>
    </div>
  )
}
