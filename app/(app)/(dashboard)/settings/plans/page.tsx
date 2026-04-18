import { Check, ArrowRight, Lock } from 'lucide-react'

const benefits = [
  '3X Value Guarantee',
  'High-Conviction Top Picks',
  '24/7 Expert Access',
  'On-demand Technical Analysis',
  'Weekly Livestreams & Daily Insights',
  'Curated Airdrop Hub',
]

export default function PlansSettingsPage() {
  return (
    <div className="max-w-4xl">
      <div>
        <h2 className="font-headline text-on-surface mb-2 text-[2.5rem] leading-tight font-bold tracking-tight">
          Plans & Subscriptions
        </h2>
        <p className="text-on-surface-variant text-base">
          Unlock premium research, proprietary top picks, and expert analysis to navigate the
          markets with conviction.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
        {/* Pricing Card */}
        <div className="border-outline-variant/30 bg-surface relative flex flex-col overflow-hidden rounded-[2rem] border p-8 shadow-sm">
          <div className="from-primary to-primary-container absolute inset-x-0 top-0 h-2 bg-gradient-to-r" />
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-on-surface text-xl font-bold">Pro Annual</h3>
            <div className="flex gap-2">
              <span className="bg-tertiary-container/20 text-tertiary rounded-full px-3 py-1 text-xs font-bold tracking-wider uppercase">
                Save 23%
              </span>
              <span className="bg-primary-container text-on-primary-container rounded-full px-3 py-1 text-xs font-bold tracking-wider uppercase">
                Most Popular
              </span>
            </div>
          </div>
          <div className="mb-8">
            <div className="flex items-baseline gap-2">
              <span className="text-on-surface text-5xl font-extrabold tracking-tight">$100</span>
              <span className="text-on-surface-variant text-lg font-medium">/ year</span>
            </div>
            <p className="text-outline mt-2 text-sm">Billed annually. Cancel anytime.</p>
          </div>
          <div className="mt-auto flex flex-col gap-4 pt-8">
            <button className="bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold shadow-md transition-all hover:shadow-lg">
              <span>Upgrade Now</span>
              <ArrowRight className="size-5" />
            </button>
            <div className="text-outline mt-2 flex items-center justify-center gap-4">
              <span className="text-sm">USDC</span>
              <span className="text-sm">USDT</span>
              <span className="text-sm">Card</span>
            </div>
          </div>
        </div>

        {/* Benefits Checklist */}
        <div className="flex flex-col justify-center">
          <h3 className="text-on-surface mb-6 text-xl font-bold">What&apos;s included in Pro</h3>
          <ul className="space-y-5">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-4">
                <div className="bg-primary/10 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full">
                  <Check className="text-primary size-4 font-bold" />
                </div>
                <span className="text-on-surface text-base font-medium">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Trust Block */}
      <div className="border-outline-variant/20 bg-surface-container-low mx-auto mt-12 max-w-2xl rounded-[2rem] border p-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="bg-surface-container-high text-primary mb-2 flex size-12 items-center justify-center rounded-full">
            <Lock className="size-6" />
          </div>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            <strong className="text-on-surface font-bold">Enterprise-Grade Security.</strong> Your
            payments are processed securely. We never store your full card details or private keys.
          </p>
        </div>
      </div>
    </div>
  )
}
