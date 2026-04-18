import { TrendingUp, Rocket } from 'lucide-react'

const TRADES = [
  {
    name: 'Ethereum (ETH)',
    type: 'Long Term Hold',
    gain: '+6,082%',
    entry: '$42.50',
    exit: '$2,630',
    icon: TrendingUp,
  },
  {
    name: 'Solana (SOL)',
    type: 'Cycle Trade',
    gain: '+1,240%',
    entry: '$14.20',
    exit: '$190.50',
    icon: TrendingUp,
  },
  {
    name: 'Injective (INJ)',
    type: 'Alpha Call',
    gain: '+850%',
    entry: '$4.10',
    exit: '$38.95',
    icon: Rocket,
  },
] as const

export function TrackRecordSection() {
  return (
    <section className="bg-surface-container-low mb-16 rounded-xl px-4 py-16" id="performance">
      <div className="mb-12 text-center">
        <h2 className="text-on-surface mb-4 text-[32px] font-black tracking-[-0.04em]">
          Proven Track Record
        </h2>
        <p className="text-on-surface-variant mx-auto max-w-2xl text-base">
          We don&apos;t just talk trends; we document entries, exits, and actualized yield. Here are
          recent closed calls.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {TRADES.map((trade) => (
          <div
            key={trade.name}
            className="bg-surface-container-lowest flex h-48 flex-col justify-between rounded-xl p-6 shadow-[0_16px_32px_-12px_rgba(11,28,48,0.04)]"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-on-surface text-lg font-bold">{trade.name}</h3>
                <p className="text-on-surface-variant mt-1 text-xs font-bold tracking-wider uppercase">
                  {trade.type}
                </p>
              </div>
              <div className="bg-surface-container-low text-primary rounded-lg p-2">
                <trade.icon className="size-5" />
              </div>
            </div>
            <div>
              <div className="text-secondary-container text-4xl font-black tracking-[-0.04em] drop-shadow-sm">
                {trade.gain}
              </div>
              <p className="text-on-surface-variant mt-2 text-xs">
                Entry: {trade.entry} | Exit: {trade.exit}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
