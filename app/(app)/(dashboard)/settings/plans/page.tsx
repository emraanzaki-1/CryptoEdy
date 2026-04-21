import { Check, ArrowRight, Lock } from 'lucide-react'
import { PageHeading } from '@/components/common/page-heading'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

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
      <PageHeading
        as="h2"
        variant="settings"
        subtitle="Unlock premium research, proprietary top picks, and expert analysis to navigate the markets with conviction."
      >
        Plans & Subscriptions
      </PageHeading>

      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
        {/* Pricing Card */}
        <Card
          variant="surface"
          className="border-outline-variant/30 bg-surface relative rounded-3xl p-8 shadow-sm"
        >
          <div className="from-primary to-primary-container absolute inset-x-0 top-0 h-2 bg-gradient-to-r" />
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-on-surface text-xl font-bold">Pro Annual</h3>
            <div className="flex gap-2">
              <span className="bg-tertiary-container/20 text-tertiary rounded-full px-3 py-1 text-xs font-bold tracking-[0.05em] uppercase">
                Save 23%
              </span>
              <span className="bg-primary-container text-on-primary-container rounded-full px-3 py-1 text-xs font-bold tracking-[0.05em] uppercase">
                Most Popular
              </span>
            </div>
          </div>
          <div className="mb-8">
            <div className="flex items-baseline gap-2">
              <span className="text-on-surface text-headline-lg font-black tracking-[-0.04em]">
                $100
              </span>
              <span className="text-on-surface-variant text-lg font-medium">/ year</span>
            </div>
            <p className="text-outline mt-2 text-sm">Billed annually. Cancel anytime.</p>
          </div>
          <div className="mt-auto flex flex-col gap-4 pt-8">
            <Button
              variant="default"
              size="xxl"
              className="hover:bg-primary-container hover:text-on-primary-container w-full rounded-2xl font-bold shadow-md hover:shadow-lg"
            >
              <span>Upgrade Now</span>
              <ArrowRight className="size-5" />
            </Button>
            <div className="text-outline mt-2 flex items-center justify-center gap-4">
              <span className="text-sm">USDC</span>
              <span className="text-sm">USDT</span>
              <span className="text-sm">Card</span>
            </div>
          </div>
        </Card>

        {/* Benefits Checklist */}
        <div className="flex flex-col justify-center">
          <h3 className="text-on-surface mb-6 text-xl font-bold">What&apos;s included in Pro</h3>
          <ul className="space-y-6">
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
      <Card variant="surface" className="mx-auto mt-12 max-w-2xl rounded-3xl p-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="bg-surface-container-high text-primary mb-2 flex size-12 items-center justify-center rounded-full">
            <Lock className="size-6" />
          </div>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            <strong className="text-on-surface font-bold">Enterprise-Grade Security.</strong> Your
            payments are processed securely. We never store your full card details or private keys.
          </p>
        </div>
      </Card>
    </div>
  )
}
