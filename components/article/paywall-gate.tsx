import Link from 'next/link'
import { Lock, LineChart, CheckCircle, CreditCard, Wallet, UserPlus } from 'lucide-react'
import { ButtonLink } from '@/components/ui/button-link'
import { Heading } from '@/components/ui/typography'

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

const GUEST_BENEFITS = [
  'Access to all free research articles',
  'Personalized feed & reading history',
  'Bookmark articles for later',
  'Daily market pulse updates',
] as const

const GUEST_HIGHLIGHTS = [
  {
    label: 'Curated research:',
    detail: 'Analysis and deep-dives vetted by our editorial team.',
  },
  {
    label: 'Market intelligence:',
    detail: 'Stay ahead with real-time insights and macro narratives.',
  },
  {
    label: 'Community access:',
    detail: 'Join 15,000+ investors sharing alpha and strategies.',
  },
] as const

interface PaywallGateProps {
  isAuthenticated?: boolean
  /** "guest" gates all content for unauthenticated users; "pro" gates Pro-only content for free users */
  variant?: 'pro' | 'guest'
  /** When false, skip the fake blurred preview text (used when real truncated content precedes the gate) */
  showPreview?: boolean
}

export function PaywallGate({
  isAuthenticated = false,
  variant = 'pro',
  showPreview = true,
}: PaywallGateProps) {
  if (variant === 'guest') {
    return <GuestGate />
  }

  return <ProGate isAuthenticated={isAuthenticated} showPreview={showPreview} />
}

/* ── Guest gate — register to read any article ───────────────────── */

function GuestGate() {
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

      {/* Gate card — two-panel layout matching Pro gate */}
      <div className="border-outline-variant/15 bg-surface-container-lowest shadow-elevated relative z-20 mt-[-80px] flex flex-col overflow-hidden rounded-2xl border md:flex-row">
        {/* Content side */}
        <div className="border-outline-variant/15 bg-surface-container-low/50 relative flex-1 overflow-hidden border-b p-8 md:border-r md:border-b-0 md:p-12">
          <div className="bg-primary/5 pointer-events-none absolute -top-1/2 right-1/4 h-64 w-64 translate-x-1/4 rounded-full blur-3xl" />

          <div className="bg-tertiary-fixed text-on-tertiary-fixed text-overline mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-bold uppercase shadow-sm">
            <Lock className="size-4" />
            Members Only
          </div>

          <Heading as="h3" className="text-on-background mb-4 font-black">
            Continue Reading with
            <br />
            <span className="text-primary">a Free CryptoEdy Account.</span>
          </Heading>

          <p className="text-on-surface-variant mb-8 font-medium">
            Join thousands of investors who rely on CryptoEdy for curated research, market
            intelligence, and actionable insights — completely free.
          </p>

          <div className="border-outline-variant/15 bg-surface-container-lowest/60 rounded-xl border p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-3">
              <LineChart className="text-primary size-6" />
              <h4 className="text-on-background font-bold">What You&apos;ll Get</h4>
            </div>
            <ul className="text-on-surface-variant text-body-sm space-y-3 font-medium">
              {GUEST_HIGHLIGHTS.map((point) => (
                <li key={point.label} className="flex items-start gap-2">
                  <CheckCircle className="text-secondary-container mt-0.5 size-[18px] shrink-0" />
                  <span>
                    <strong>{point.label}</strong> {point.detail}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA side */}
        <div className="bg-surface-container-lowest flex w-full flex-col items-center justify-center p-8 text-center md:w-[380px] md:p-12">
          <div className="text-primary text-overline mb-4 font-bold uppercase">Free Forever</div>
          <div className="mb-2 flex items-baseline justify-center gap-1">
            <span className="text-on-background text-headline-lg font-black">$0</span>
          </div>
          <p className="text-outline text-body-sm mb-8">No credit card required</p>

          <ul className="text-on-surface-variant text-body-sm mx-auto mb-8 w-full max-w-[240px] space-y-4 text-left font-medium">
            {GUEST_BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-center gap-3">
                <CheckCircle className="text-secondary-container size-[18px] shrink-0" />
                {benefit}
              </li>
            ))}
          </ul>

          <ButtonLink href="/register" variant="gradient" size="xxl" className="w-full">
            <UserPlus className="size-5" />
            Create Free Account
          </ButtonLink>

          <p className="text-outline text-micro mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

/* ── Pro gate — upgrade to read Pro-only content ─────────────────── */

function ProGate({
  isAuthenticated,
  showPreview,
}: {
  isAuthenticated: boolean
  showPreview: boolean
}) {
  return (
    <div className="relative mt-12 mb-16 pb-8">
      {/* Blurred preview — only shown when no real truncated content precedes the gate */}
      {showPreview && (
        <>
          <div className="via-background/80 to-background pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-transparent" />
          <div className="relative z-0 space-y-6 opacity-40 blur-[2px]">
            <p>
              Looking closely at the M2 money supply overlaid with Bitcoin&apos;s localized hash
              rate distribution, a clear divergence emerges. The standard narrative suggests a
              correlation, but our models show a decoupling driven by structural scarcity.
            </p>
            <p>
              This specific divergence has only occurred three times in the asset&apos;s history. In
              each previous instance, the subsequent 18-month window saw aggregate market cap
              expansion exceeding 400%.
            </p>
          </div>
        </>
      )}

      {/* Gate card */}
      <div className="border-outline-variant/15 bg-surface-container-lowest shadow-elevated relative z-20 mt-[-80px] flex flex-col overflow-hidden rounded-2xl border md:flex-row">
        {/* Content side */}
        <div className="border-outline-variant/15 bg-surface-container-low/50 relative flex-1 overflow-hidden border-b p-8 md:border-r md:border-b-0 md:p-12">
          <div className="bg-primary/5 pointer-events-none absolute -top-1/2 right-1/4 h-64 w-64 translate-x-1/4 rounded-full blur-3xl" />

          <div className="bg-tertiary-fixed text-on-tertiary-fixed text-overline mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-bold uppercase shadow-sm">
            <Lock className="size-4" />
            Exclusive Pro Research
          </div>

          <Heading as="h3" className="text-on-background mb-4 font-black">
            Don&apos;t Trade in the Dark.
            <br />
            <span className="text-primary">Unlock the Full Report.</span>
          </Heading>

          <p className="text-on-surface-variant mb-8 font-medium">
            Join 15,000+ professional investors receiving institutional-grade analysis, real-time
            alerts, and deep-dive reports.
          </p>

          <div className="border-outline-variant/15 bg-surface-container-lowest/60 rounded-xl border p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-3">
              <LineChart className="text-primary size-6" />
              <h4 className="text-on-background font-bold">The Executive Summary</h4>
            </div>
            <ul className="text-on-surface-variant text-body-sm space-y-3 font-medium">
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
          <div className="text-primary text-overline mb-4 font-bold uppercase">
            Annual Membership
          </div>
          <div className="mb-8 flex items-baseline justify-center gap-1">
            <span className="text-on-background text-headline-lg font-black">$100</span>
            <span className="text-outline text-subtitle font-medium">/ year</span>
          </div>
          <ul className="text-on-surface-variant text-body-sm mx-auto mb-8 w-full max-w-[240px] space-y-4 text-left font-medium">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <CheckCircle className="text-secondary-container size-[18px]" />
                {feature}
              </li>
            ))}
          </ul>
          <ButtonLink
            href={isAuthenticated ? '/upgrade' : '/register'}
            variant="gradient"
            size="xxl"
            className="w-full"
          >
            {isAuthenticated ? 'Upgrade to Pro' : 'Create Account & Go Pro'}
          </ButtonLink>
          <div className="text-outline text-micro mt-6 flex items-center justify-center gap-3">
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
