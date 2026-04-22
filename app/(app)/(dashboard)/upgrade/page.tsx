import Link from 'next/link'
import { Shield, Award, LineChart, Headphones } from 'lucide-react'
import { Heading, Body, Overline } from '@/components/ui/typography'
import { Card } from '@/components/ui/card'
import { ButtonLink } from '@/components/ui/button-link'
import { CheckoutButton } from '@/components/payments/CheckoutButton'
import { auth } from '@/lib/auth'
import { generateIntentToken } from '@/lib/payments/intent'

const benefits = [
  {
    icon: Award,
    title: '3X Value Guarantee',
    description: "If our signals don't outperform the benchmark by 3X, your next year is free.",
  },
  {
    icon: Headphones,
    title: '24/7 Expert Access',
    description: 'Direct channel to our senior market analysts and research curators.',
  },
  {
    icon: LineChart,
    title: 'Top Picks & Alpha',
    description: 'Early-stage project reports and high-conviction momentum signals.',
  },
  {
    icon: Shield,
    title: 'On-demand Technical Analysis',
    description: 'Advanced chart patterns and institutional flow metrics for all pairs.',
  },
]

export default async function UpgradePage() {
  const session = await auth()
  const userId = (session?.user as { id?: string } | undefined)?.id ?? ''
  const intentData = userId ? generateIntentToken(userId) : null

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-8 lg:py-16">
      {/* Header */}
      <div className="mb-10">
        <Heading as="h1" size="lg" responsive>
          Complete your upgrade
        </Heading>
        <Body className="text-on-surface-variant mt-2 max-w-2xl">
          Unlock the full potential of CryptoEdy with Pro. Professional-grade research, curated
          picks, and expert access — all for one annual price.
        </Body>
      </div>

      {/* Two-column checkout grid */}
      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12">
        {/* Left column — Order summary */}
        <div className="space-y-6 lg:col-span-5">
          <Card variant="surface-lowest" className="p-8">
            <div className="mb-8 flex items-start justify-between">
              <div>
                <Heading as="h2">Annual Pro Plan</Heading>
                <Body size="sm" className="text-on-surface-variant mt-1">
                  Billed annually
                </Body>
              </div>
              <div className="text-right">
                <span className="text-primary text-headline-lg font-black">$100</span>
                <Body size="sm" className="text-on-surface-variant">
                  / year
                </Body>
              </div>
            </div>

            <div className="space-y-5">
              <Overline className="text-outline">Membership Benefits</Overline>
              <ul className="space-y-5">
                {benefits.map((benefit) => (
                  <li key={benefit.title} className="flex items-start gap-3">
                    <div className="bg-secondary/10 mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg">
                      <benefit.icon className="text-secondary size-4" />
                    </div>
                    <div>
                      <Body className="text-on-surface font-bold">{benefit.title}</Body>
                      <Body size="sm" className="text-on-surface-variant mt-0.5 leading-relaxed">
                        {benefit.description}
                      </Body>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          {/* Trust seal */}
          <Card variant="surface" className="flex items-center gap-4 p-5">
            <div className="bg-surface-container-lowest flex size-11 shrink-0 items-center justify-center rounded-xl">
              <Shield className="text-primary size-5" />
            </div>
            <div>
              <Body className="text-on-surface font-bold">Secure Web3 Transaction</Body>
              <Body size="sm" className="text-on-surface-variant">
                Payments are processed directly on-chain. We never store your private keys.
              </Body>
            </div>
          </Card>
        </div>

        {/* Right column — Payment */}
        <div className="lg:col-span-7">
          <Card variant="surface-lowest" className="p-8 lg:p-10">
            <div className="mb-6">
              <Heading as="h2">Payment Method</Heading>
              <Body size="sm" className="text-on-surface-variant mt-1">
                Select your preferred cryptocurrency or pay with card
              </Body>
            </div>

            {intentData ? (
              <CheckoutButton intentData={intentData} inline />
            ) : (
              <div className="flex flex-col items-center gap-4 py-8">
                <Body className="text-on-surface-variant text-center">
                  Sign in to complete your upgrade
                </Body>
                <ButtonLink href="/login" variant="gradient" size="xl" className="rounded-full">
                  Sign in
                </ButtonLink>
              </div>
            )}

            <Body size="sm" className="text-outline mt-6 text-center leading-relaxed">
              By proceeding, you agree to our{' '}
              <Link href="/terms" className="text-primary underline">
                Terms of Service
              </Link>{' '}
              and confirm you have read our risk disclosure regarding crypto assets.
            </Body>
          </Card>
        </div>
      </div>
    </div>
  )
}
