import { Layers, Wallet, PieChart, ArrowDownUp, Zap } from 'lucide-react'

const HIGHLIGHTS = [
  {
    icon: Wallet,
    title: 'Multi-Chain Visibility',
    description: 'Connect wallets across EVM, Solana, and Cosmos chains in a unified dashboard.',
  },
  {
    icon: PieChart,
    title: 'Cost-Basis Analysis',
    description: 'Deep attribution modeling to understand your true realized and unrealized PnL.',
  },
  {
    icon: ArrowDownUp,
    title: 'DeFi Position Tracking',
    description: 'Monitor LP positions, staking rewards, and lending collateral across protocols.',
  },
] as const

export default function TrackerPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        {/* Text */}
        <div className="flex flex-col gap-6">
          <div>
            <span className="bg-secondary-container text-on-secondary-container text-overline mb-4 inline-block rounded-full px-3 py-1 font-bold uppercase">
              Coming Soon
            </span>
            <h1 className="text-on-surface text-headline lg:text-headline-lg mb-4 font-black">
              Portfolio <span className="text-primary">Tracker.</span>
            </h1>
            <p className="text-on-surface-variant max-w-md text-base leading-relaxed">
              Advanced portfolio analytics to understand exactly where your alpha is coming from
              across chains and DeFi protocols.
            </p>
          </div>

          <div className="flex flex-col gap-5">
            {HIGHLIGHTS.map((h) => (
              <div key={h.title} className="flex items-start gap-4">
                <div className="bg-surface-container-high text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
                  <h.icon className="size-5" />
                </div>
                <div>
                  <h3 className="text-on-surface text-sm font-bold">{h.title}</h3>
                  <p className="text-on-surface-variant mt-0.5 text-sm">{h.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visual */}
        <div className="relative">
          <div className="bg-surface-container-low relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl">
            <div className="from-primary/10 absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_var(--tw-gradient-stops))] via-transparent to-transparent" />
            <div className="bg-primary-container/20 absolute -bottom-8 -left-8 size-48 rounded-full blur-3xl" />

            {/* Simulated pie chart segments */}
            <div className="absolute top-1/4 left-1/4 opacity-10">
              <div className="bg-primary size-24 rounded-full" />
              <div className="bg-secondary absolute top-0 left-12 size-16 rounded-full" />
              <div className="bg-tertiary absolute top-14 left-4 size-12 rounded-full" />
            </div>

            <div className="relative flex flex-col items-center gap-4">
              <div className="bg-surface-container-lowest shadow-primary/10 flex size-20 items-center justify-center rounded-3xl shadow-xl">
                <Layers className="text-primary size-10" strokeWidth={1.2} />
              </div>
              <div className="flex gap-2">
                <div className="bg-primary/20 h-1.5 w-10 animate-pulse rounded-full [animation-duration:2s]" />
                <div className="bg-primary/10 h-1.5 w-20 animate-pulse rounded-full [animation-delay:0.3s] [animation-duration:2s]" />
                <div className="bg-primary/5 h-1.5 w-6 animate-pulse rounded-full [animation-delay:0.6s] [animation-duration:2s]" />
              </div>
            </div>
          </div>

          {/* Floating status badge */}
          <div className="bg-surface-container-lowest shadow-primary/5 absolute -bottom-4 -left-4 hidden items-center gap-3 rounded-2xl p-3 shadow-xl md:flex">
            <div className="bg-secondary text-on-secondary flex size-9 items-center justify-center rounded-full">
              <Zap className="size-4" />
            </div>
            <div>
              <p className="text-on-surface-variant text-overline font-bold uppercase">Status</p>
              <p className="text-on-surface text-sm font-bold">Coming Soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
