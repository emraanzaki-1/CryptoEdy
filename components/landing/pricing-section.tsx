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
    <section
      className="bg-surface-container-low flex flex-col gap-10 overflow-hidden rounded-2xl px-6 py-14 md:flex-row md:items-start md:gap-16 md:px-10"
      id="pricing"
    >
      {/* Left — copy */}
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex flex-col gap-3">
          <span className="text-primary text-xs font-semibold tracking-[0.05em] uppercase">
            Simple &middot; $0 on-chain
          </span>
          <h2 className="font-headline text-on-surface text-headline md:text-headline-md font-black">
            $100 a year.
            <br />
            Stablecoins only.
          </h2>
        </div>
        <p className="text-on-surface-variant max-w-sm text-sm leading-relaxed">
          Pay with any major stablecoin. Pass to wallet or USDT on chain of your choice.
        </p>
        <div>
          <Link
            href="/register"
            className="from-primary to-primary-container text-on-primary inline-flex items-center justify-center rounded-xl bg-gradient-to-b px-8 py-3.5 text-sm font-bold tracking-[0.015em] shadow-lg transition-transform hover:-translate-y-1"
          >
            Subscribe Now
          </Link>
        </div>
        <div className="text-on-surface-variant flex items-center gap-2 text-xs font-medium">
          <Wallet className="size-4" />
          <span>Pay with crypto: USDC / USDT</span>
        </div>
      </div>

      {/* Right — pricing card */}
      <div className="bg-surface-container-lowest relative flex-1 overflow-hidden rounded-2xl p-8 shadow-[0_16px_32px_-12px_rgba(11,28,48,0.04)]">
        {/* Decorative chart */}
        <div className="pointer-events-none absolute top-6 right-6 h-24 w-32 opacity-70">
          <svg viewBox="0 0 112 80" fill="none" className="h-full w-full">
            <path
              d="M0,60 L14,55 L28,58 L42,40 L56,35 L70,38 L84,20 L98,12 L112,8"
              stroke="var(--color-secondary)"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M0,60 L14,55 L28,58 L42,40 L56,35 L70,38 L84,20 L98,12 L112,8 L112,80 L0,80 Z"
              fill="var(--color-secondary)"
              opacity="0.12"
            />
          </svg>
        </div>

        <div className="relative flex flex-col gap-6">
          <div className="flex items-start gap-0.5">
            <span className="text-on-surface-variant mt-2 text-2xl font-bold">$</span>
            <span className="text-on-surface text-6xl font-black tracking-[-0.04em]">100</span>
          </div>
          <p className="text-on-surface-variant text-sm">Billed annually. Cancel anytime.</p>

          <div className="mt-2 pt-6">
            <ul className="flex flex-col gap-4">
              {FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <CheckCircle className="text-primary mt-0.5 size-4 shrink-0" />
                  <span className="text-on-surface text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
