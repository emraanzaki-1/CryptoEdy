import Link from 'next/link'
import { Gavel, ShieldCheck, Globe, CircleX, CircleCheck, TriangleAlert } from 'lucide-react'
import { GuestPage } from '@/components/layouts/guest-shell'
import { Card } from '@/components/ui/card'
import { SidebarNav } from '@/components/common/sidebar-nav'
import { Heading, Title } from '@/components/ui/typography'

export const metadata = {
  title: 'Terms of Service – CryptoEdy',
  description: 'Terms of Service for CryptoEdy Research.',
}

const sidebarLinks = [
  { id: 'intro', num: '01', label: 'Introduction' },
  { id: 'eligibility', num: '02', label: 'User Eligibility' },
  { id: 'subscription', num: '03', label: 'Subscription Terms' },
  { id: 'rights', num: '04', label: 'Content Rights' },
  { id: 'liability', num: '05', label: 'Disclaimers' },
]

export default function TermsPage() {
  return (
    <GuestPage>
      {/* ── Hero Header ── */}
      <header className="mb-20">
        <div className="bg-surface-container text-primary text-overline font-bolduppercase mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1">
          <Gavel className="size-3.5" />
          Legal Framework
        </div>
        <Heading as="h1" size="lg" className="mb-8 max-w-4xl font-black">
          Terms of <span className="text-primary">Service.</span>
        </Heading>
        <p className="text-on-surface-variant text-subtitle max-w-2xl font-medium">
          Last updated: April 20, 2026. These terms govern your access to the CryptoEdy research
          ecosystem and platform.
        </p>
      </header>

      {/* ── 12-col Grid: Sidebar + Content ── */}
      <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
        {/* Sticky Sidebar Nav */}
        <SidebarNav links={sidebarLinks} />

        {/* Main Content */}
        <article className="space-y-24 lg:col-span-9">
          {/* S1 — Introduction */}
          <section id="intro" className="scroll-mt-32">
            <Heading className="mb-8 flex items-baseline gap-4 font-black">
              <span className="text-primary/30 text-headline-md italic">01</span>
              Introduction
            </Heading>
            <Card variant="elevated" className="p-8 md:p-10">
              <div className="text-on-surface-variant text-body space-y-6">
                <p>
                  Welcome to <span className="text-on-surface font-bold">CryptoEdy</span> (the
                  &quot;Platform&quot;), an institutional-grade research hub for digital asset
                  intelligence. By accessing our proprietary data, analysis, and research tools, you
                  agree to be bound by these Terms of Service.
                </p>
                <p>
                  Our mission is to provide high-end editorial insight into the digital asset
                  markets. These terms are designed to ensure the integrity of our research and the
                  security of our community. If you do not agree, you may not use the Service.
                </p>
              </div>
            </Card>
          </section>

          {/* S2 — User Eligibility */}
          <section id="eligibility" className="scroll-mt-32">
            <Heading className="mb-8 flex items-baseline gap-4 font-black">
              <span className="text-primary/30 text-headline-md italic">02</span>
              User Eligibility
            </Heading>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="bg-surface-container-low border-primary rounded-xl border-l-4 p-8">
                <ShieldCheck className="text-primary mb-4 size-7" />
                <h3 className="text-on-surface mb-2 font-bold">Age Requirement</h3>
                <p className="text-on-surface-variant text-body-sm">
                  Users must be at least 18 years of age or the legal age of majority in their
                  jurisdiction to access the platform. You are responsible for maintaining the
                  confidentiality of your account credentials.
                </p>
              </div>
              <div className="bg-surface-container-low border-secondary rounded-xl border-l-4 p-8">
                <Globe className="text-secondary mb-4 size-7" />
                <h3 className="text-on-surface mb-2 font-bold">Jurisdiction</h3>
                <p className="text-on-surface-variant text-body-sm">
                  Services are not available in regions where digital asset research is prohibited
                  by law. You agree not to misuse the Service, including attempting to gain
                  unauthorized access or using it for any unlawful purpose.
                </p>
              </div>
            </div>
          </section>

          {/* S3 — Subscription & Payments */}
          <section id="subscription" className="scroll-mt-32">
            <Heading className="mb-8 flex items-baseline gap-4 font-black">
              <span className="text-primary/30 text-headline-md italic">03</span>
              Subscription &amp; Payments
            </Heading>
            <div className="bg-inverse-surface text-inverse-on-surface relative overflow-hidden rounded-xl p-8 shadow-2xl md:p-12">
              <div className="relative z-10">
                <div className="border-inverse-on-surface/10 mb-10 flex flex-col items-start justify-between gap-8 border-b pb-10 md:flex-row md:items-center">
                  <div>
                    <Heading as="h3" className="mb-2 font-black">
                      Premium Research Access
                    </Heading>
                    <p className="text-inverse-on-surface/60 font-medium">
                      Full institutional research suite
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                  <div className="space-y-4">
                    <h4 className="text-primary-fixed text-overline font-blackuppercase">
                      Billing
                    </h4>
                    <p className="text-inverse-on-surface/80 text-body-sm">
                      Premium features require a paid subscription. Subscriptions are billed on a
                      recurring basis according to your selected plan.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-primary-fixed text-overline font-blackuppercase">
                      Cancellation
                    </h4>
                    <p className="text-inverse-on-surface/80 text-body-sm">
                      You may cancel at any time, and your access will continue until the end of the
                      current billing period. No partial refunds are provided.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-primary-fixed text-overline font-blackuppercase">
                      Changes
                    </h4>
                    <p className="text-inverse-on-surface/80 text-body-sm">
                      We reserve the right to modify pricing with notice. Continued use after
                      changes constitutes acceptance of the new terms.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-primary/20 absolute top-0 right-0 size-64 translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]" />
            </div>
          </section>

          {/* S4 — Content Rights */}
          <section id="rights" className="scroll-mt-32">
            <Heading className="mb-8 flex items-baseline gap-4 font-black">
              <span className="text-primary/30 text-headline-md italic">04</span>
              Content Rights
            </Heading>
            <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
              <div className="space-y-6">
                <p className="text-on-surface-variant text-body">
                  All research, charts, editorial commentary, and proprietary metrics are the
                  intellectual property of CryptoEdy Research and are protected by applicable
                  copyright and trademark laws.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <CircleX className="text-error size-5 shrink-0" />
                    <p className="text-body-sm font-bold">No Commercial Redistribution</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <CircleX className="text-error size-5 shrink-0" />
                    <p className="text-body-sm font-bold">No AI Training Scraping</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <CircleCheck className="text-secondary size-5 shrink-0" />
                    <p className="text-body-sm font-bold">Limited Individual Citation Allowed</p>
                  </div>
                </div>
              </div>
              <div className="bg-surface-container aspect-square rounded-xl" />
            </div>
          </section>

          {/* S5 — Liability Disclaimers */}
          <section id="liability" className="scroll-mt-32">
            <Heading className="mb-8 flex items-baseline gap-4 font-black">
              <span className="text-primary/30 text-headline-md italic">05</span>
              Disclaimers
            </Heading>
            <div className="bg-error-container rounded-xl p-8 md:p-10">
              <div className="flex items-start gap-6">
                <div className="bg-error shrink-0 rounded-lg p-3">
                  <TriangleAlert className="text-on-error size-5" />
                </div>
                <div className="space-y-4">
                  <Title as="h3" className="text-on-error-container font-black uppercase">
                    Not Financial Advice
                  </Title>
                  <p className="text-on-error-container text-body">
                    CryptoEdy is an editorial publication. All content is for informational and
                    educational purposes only and does not constitute financial, investment, legal,
                    or tax advice. Cryptocurrencies are highly volatile, and past performance is not
                    indicative of future results.
                  </p>
                  <p className="text-on-error-container/70 text-body-sm italic">
                    You are solely responsible for your own investment decisions. Always conduct
                    your own due diligence and consult a qualified financial advisor.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Bottom CTA */}
          <div className="border-outline-variant/30 border-t pt-12 text-center">
            <p className="text-outline text-body-sm font-medium">
              Questions regarding these terms?{' '}
              <Link
                href="/contact"
                className="text-primary font-bold underline-offset-4 hover:underline"
              >
                Contact our team
              </Link>
            </p>
          </div>
        </article>
      </div>
    </GuestPage>
  )
}
