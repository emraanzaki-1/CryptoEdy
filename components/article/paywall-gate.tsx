import Link from 'next/link'
import { Lock, LineChart, CheckCircle, CreditCard, Wallet } from 'lucide-react'

const SUMMARY_POINTS = [
  {
    label: 'Compounding ETF flows:',
    detail: 'The hidden multiplier effect in institutional adoption.',
  },
  {
    label: 'Liquidity cycle shifts:',
    detail: 'Predicting the Q4 macro rotation with high probability.',
  },
  {
    label: 'The Altcoin Compression:',
    detail: 'Identifying the 3 sectors primed for violent upside breakout.',
  },
] as const

const FEATURES = [
  'Access to 500+ Deep Dive Reports',
  'Private Alpha Community Access',
  'Daily Market Pulse Alerts',
  'Proprietary On-Chain Indicators',
] as const

export function PaywallGate() {
  return (
    <div className="relative mt-12 mb-16 pb-8">
      {/* Blurred preview */}
      <div className="via-background/80 to-background pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-transparent" />
      <div className="relative z-0 space-y-6 opacity-40 blur-[2px]">
        <p>
          Looking closely at the M2 money supply overlaid with Bitcoin&apos;s localized hash rate
          distribution, a clear divergence emerges. The standard narrative suggests a correlation,
          but our models show a decoupling driven by structural scarcity.
        </p>
        <p>
          This specific divergence has only occurred three times in the asset&apos;s history. In
          each previous instance, the subsequent 18-month window saw aggregate market cap expansion
          exceeding 400%.
        </p>
      </div>

      {/* Gate card */}
      <div className="border-outline-variant/15 bg-surface-container-lowest relative z-20 mt-[-80px] flex flex-col overflow-hidden rounded-2xl border shadow-[0_32px_64px_-12px_rgba(11,28,48,0.06)] md:flex-row">
        {/* Content side */}
        <div className="border-outline-variant/15 bg-surface-container-low/50 relative flex-1 overflow-hidden border-b p-8 md:border-r md:border-b-0 md:p-12">
          <div className="bg-primary/5 pointer-events-none absolute -top-1/2 right-1/4 h-64 w-64 translate-x-1/4 rounded-full blur-3xl" />

          <div className="bg-tertiary-fixed text-on-tertiary-fixed mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold tracking-widest uppercase shadow-sm">
            <Lock className="size-4" />
            Exclusive Pro Research
          </div>

          <h3 className="text-on-background mb-4 text-3xl leading-tight font-black">
            Don&apos;t Trade in the Dark.
            <br />
            <span className="text-primary">Unlock the Full Report.</span>
          </h3>

          <p className="text-on-surface-variant mb-8 font-medium">
            Join 15,000+ professional investors receiving institutional-grade analysis, real-time
            alerts, and deep-dive reports.
          </p>

          <div className="border-outline-variant/15 bg-surface-container-lowest/60 rounded-xl border p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-3">
              <LineChart className="text-primary size-6" />
              <h4 className="text-on-background font-bold">The Executive Summary</h4>
            </div>
            <ul className="text-on-surface-variant space-y-3 text-sm font-medium">
              {SUMMARY_POINTS.map((point) => (
                <li key={point.label} className="flex items-start gap-2">
                  <CheckCircle className="text-secondary-container mt-0.5 size-[18px]" />
                  <span>
                    <strong>{point.label}</strong> {point.detail}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Pricing side */}
        <div className="bg-surface-container-lowest flex w-full flex-col items-center justify-center p-8 text-center md:w-[380px] md:p-12">
          <div className="text-primary mb-4 text-sm font-bold tracking-widest uppercase">
            Annual Membership
          </div>
          <div className="mb-8 flex items-baseline justify-center gap-1">
            <span className="text-on-background text-5xl font-black tracking-tighter">$100</span>
            <span className="text-outline text-lg font-medium">/ year</span>
          </div>
          <ul className="text-on-surface-variant mx-auto mb-8 w-full max-w-[240px] space-y-4 text-left text-sm font-medium">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <CheckCircle className="text-secondary-container size-[18px]" />
                {feature}
              </li>
            ))}
          </ul>
          <Link
            href="/register"
            className="from-primary to-primary-container text-on-primary w-full rounded-xl bg-gradient-to-b py-4 text-lg font-bold shadow-[0_8px_16px_-4px_rgba(0,62,199,0.3)] transition-opacity hover:opacity-90"
          >
            Get Pro Access Now
          </Link>
          <div className="text-outline mt-6 flex items-center justify-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <Wallet className="size-3.5" /> Crypto Accepted
            </span>
            <span className="bg-outline-variant size-1 rounded-full" />
            <span className="flex items-center gap-1">
              <CreditCard className="size-3.5" /> Card Accepted
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
