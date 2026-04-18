import Link from 'next/link'
import { CheckCircle, Wallet } from 'lucide-react'

const FEATURES = [
  'Full access to deep-dive research reports',
  'Real-time alerts for high-conviction entries',
  'Weekly macro and liquidity analysis',
  'Exclusive community access',
] as const

export function PricingSection() {
  return (
    <section className="mb-16 flex flex-col items-center px-4 py-16" id="pricing">
      <div className="mb-10 text-center">
        <h2 className="text-on-surface mb-4 text-[32px] font-black tracking-[-0.04em]">
          Invest in an Edge
        </h2>
        <p className="text-on-surface-variant text-base">
          Simple, transparent pricing for institutional-grade insights.
        </p>
      </div>
      <div className="bg-surface-container-lowest relative w-full max-w-md overflow-hidden rounded-xl p-8 shadow-[0_32px_64px_-16px_rgba(11,28,48,0.08)]">
        {/* Decorative blur */}
        <div className="bg-primary/10 pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full blur-3xl" />

        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-on-surface text-2xl font-bold">Pro Annual</h3>
          <span className="bg-tertiary-fixed text-on-tertiary-fixed-variant rounded-full px-3 py-1 text-xs font-bold tracking-wider uppercase">
            Most Popular
          </span>
        </div>

        <div className="border-outline-variant/15 mb-8 border-b pb-8">
          <div className="flex items-baseline gap-1">
            <span className="text-on-surface text-5xl font-black tracking-[-0.04em]">$100</span>
            <span className="text-on-surface-variant text-sm font-medium">/ year</span>
          </div>
          <p className="text-on-surface-variant mt-2 text-sm">Billed annually. Cancel anytime.</p>
        </div>

        <ul className="mb-10 flex flex-col gap-5">
          {FEATURES.map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              <CheckCircle className="text-primary mt-0.5 size-5" />
              <span className="text-on-surface text-sm font-medium">{feature}</span>
            </li>
          ))}
        </ul>

        <Link
          href="/register"
          className="from-primary to-primary-container text-on-primary mb-4 flex w-full cursor-pointer items-center justify-center rounded-xl bg-gradient-to-b py-4 text-base font-bold tracking-[0.015em] shadow-lg transition-transform hover:-translate-y-1"
        >
          Subscribe Now
        </Link>

        <div className="text-on-surface-variant flex items-center justify-center gap-2 text-xs font-medium">
          <span>Pay with crypto accepted:</span>
          <Wallet className="size-4" /> USDC/USDT
        </div>
      </div>
    </section>
  )
}
