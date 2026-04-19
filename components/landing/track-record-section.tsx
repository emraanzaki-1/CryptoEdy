import { TrendingUp, Rocket } from 'lucide-react'

const TRADES = [
  {
    name: 'Ethereum (ETH)',
    ticker: 'ETH',
    gain: '+6,082%',
    entry: '$42.50',
    exit: '$2,630',
    icon: TrendingUp,
    // Simple upward sparkline path
    sparkline: 'M0,32 L8,28 L16,30 L24,22 L32,18 L40,20 L48,12 L56,8 L64,4 L72,2 L80,0',
  },
  {
    name: 'Solana (SOL)',
    ticker: 'SOL',
    gain: '+1,240%',
    entry: '$14.20',
    exit: '$190.50',
    icon: TrendingUp,
    sparkline: 'M0,30 L10,28 L20,32 L30,20 L40,24 L50,10 L60,14 L70,6 L80,2',
  },
  {
    name: 'Injective (INJ)',
    ticker: 'INJ',
    gain: '+850%',
    entry: '$4.10',
    exit: '$38.95',
    icon: Rocket,
    sparkline: 'M0,28 L10,30 L20,26 L30,22 L40,18 L50,20 L60,10 L70,6 L80,4',
  },
] as const

export function TrackRecordSection() {
  return (
    <section
      className="bg-surface-container-low flex flex-col gap-10 rounded-2xl px-6 py-14 md:px-10"
      id="performance"
    >
      {/* Split header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-3 md:max-w-sm">
          <span className="text-primary text-xs font-semibold tracking-[0.05em] uppercase">
            Track Record
          </span>
          <h2 className="font-headline text-on-surface text-headline md:text-headline-md font-black">
            Seven years.
            <br />
            All on the record.
          </h2>
        </div>
        <p className="text-on-surface-variant max-w-sm text-sm leading-relaxed">
          We don&apos;t just talk trends — we document entries, exits, and actualized yield. Here
          are recent closed calls.
        </p>
      </div>

      {/* Trade cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {TRADES.map((trade) => (
          <div
            key={trade.name}
            className="bg-surface-container-lowest flex flex-col gap-5 rounded-2xl p-6 shadow-[0_16px_32px_-12px_rgba(11,28,48,0.04)]"
          >
            {/* Header row */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-on-surface text-base font-bold">{trade.name}</h3>
              </div>
              <div className="bg-surface-container-low text-primary rounded-lg p-1.5">
                <trade.icon className="size-4" />
              </div>
            </div>

            {/* Sparkline */}
            <div className="flex h-12 items-end">
              <svg
                viewBox="0 0 80 32"
                fill="none"
                className="h-full w-full"
                preserveAspectRatio="none"
              >
                <path
                  d={trade.sparkline}
                  stroke="var(--color-secondary)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                <path
                  d={`${trade.sparkline} L80,32 L0,32 Z`}
                  fill="var(--color-secondary)"
                  opacity="0.15"
                />
              </svg>
            </div>

            {/* Gain */}
            <div className="flex items-end justify-between">
              <div className="text-secondary text-3xl font-black tracking-[-0.04em]">
                {trade.gain}
              </div>
              <p className="text-on-surface-variant text-label">
                {trade.entry} → {trade.exit}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
