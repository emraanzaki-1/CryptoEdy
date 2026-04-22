import { TriangleAlert, Scale, BookOpen, CircleAlert } from 'lucide-react'
import { GuestPage } from '@/components/layouts/guest-shell'
import { getNavCategories } from '@/lib/categories/getCategories'
import { SidebarNav } from '@/components/common/sidebar-nav'
import { Heading, Title } from '@/components/ui/typography'

export const metadata = {
  title: 'Financial Disclaimer – CryptoEdy',
  description:
    'Important financial disclaimer for CryptoEdy Research. All content is for educational and informational purposes only and does not constitute financial advice.',
  alternates: {
    canonical: `${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/legal/disclaimer`,
  },
}

const sidebarLinks = [
  { id: 'overview', num: '01', label: 'Overview' },
  { id: 'no-advice', num: '02', label: 'Not Financial Advice' },
  { id: 'risks', num: '03', label: 'Investment Risks' },
  { id: 'accuracy', num: '04', label: 'Accuracy & Limitations' },
  { id: 'liability', num: '05', label: 'Limitation of Liability' },
]

export default async function DisclaimerPage() {
  const navCategories = await getNavCategories()

  return (
    <GuestPage navCategories={navCategories}>
      {/* ── Hero Header ── */}
      <header className="mb-20">
        <div className="bg-surface-container text-primary text-overline mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1 font-bold uppercase">
          <TriangleAlert className="size-3.5" />
          Legal Framework
        </div>
        <Heading as="h1" size="lg" className="mb-8 max-w-4xl font-black">
          Financial <span className="text-primary">Disclaimer.</span>
        </Heading>
        <p className="text-on-surface-variant text-subtitle max-w-2xl font-medium">
          Last updated: April 20, 2026. Please read this disclaimer carefully before using CryptoEdy
          Research.
        </p>
      </header>

      {/* ── 12-col Grid: Sidebar + Content ── */}
      <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
        {/* Sticky Sidebar Nav */}
        <SidebarNav links={sidebarLinks} />

        {/* Content */}
        <main className="space-y-14 lg:col-span-8">
          {/* ── Overview ── */}
          <section id="overview" className="scroll-mt-24">
            <div className="mb-6 flex items-center gap-3">
              <div className="bg-primary/10 flex size-10 items-center justify-center rounded-xl">
                <BookOpen className="text-primary size-5" />
              </div>
              <Title as="h2" className="font-bold">
                Overview
              </Title>
            </div>
            <div className="text-on-surface-variant text-body-lg space-y-4">
              <p>
                CryptoEdy Research (&ldquo;CryptoEdy&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or
                &ldquo;us&rdquo;) provides research, analysis, educational content, and market
                commentary through this platform. All content published on CryptoEdy is intended
                solely for{' '}
                <strong className="text-on-surface">educational and informational purposes</strong>.
              </p>
              <p>
                Nothing on this platform constitutes financial advice, investment advice, trading
                advice, or any other type of regulated financial service. CryptoEdy is not a
                registered investment advisor, broker-dealer, or financial institution in any
                jurisdiction.
              </p>
            </div>
          </section>

          {/* ── Not Financial Advice ── */}
          <section id="no-advice" className="scroll-mt-24">
            <div className="mb-6 flex items-center gap-3">
              <div className="bg-primary/10 flex size-10 items-center justify-center rounded-xl">
                <Scale className="text-primary size-5" />
              </div>
              <Title as="h2" className="font-bold">
                Not Financial Advice
              </Title>
            </div>
            <div className="text-on-surface-variant text-body-lg space-y-4">
              <p>
                The information provided on CryptoEdy — including but not limited to research
                reports, token picks, market analysis, airdrop guides, and educational materials —
                does <strong className="text-on-surface">not</strong> constitute:
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Financial or investment advice</li>
                <li>
                  A solicitation or offer to buy or sell any security, token, or cryptocurrency
                </li>
                <li>Legal, tax, or accounting advice</li>
                <li>A recommendation to acquire or dispose of any asset</li>
              </ul>
              <p>
                You should always conduct your own independent research and seek advice from a
                qualified financial professional before making any investment decisions. Past
                performance highlighted on this platform is not indicative of future results.
              </p>
            </div>
          </section>

          {/* ── Investment Risks ── */}
          <section id="risks" className="scroll-mt-24">
            <div className="mb-6 flex items-center gap-3">
              <div className="bg-error/10 flex size-10 items-center justify-center rounded-xl">
                <TriangleAlert className="text-error size-5" />
              </div>
              <Title as="h2" className="font-bold">
                Investment Risks
              </Title>
            </div>
            <div className="text-on-surface-variant text-body-lg space-y-4">
              <p>
                Cryptocurrency and digital asset markets are highly volatile and speculative. You
                should be aware that:
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li>
                  The value of cryptocurrencies can fall to zero and you may lose your entire
                  investment.
                </li>
                <li>
                  Markets can move quickly and unpredictably due to regulatory changes, market
                  sentiment, technological developments, or other factors.
                </li>
                <li>
                  Airdrop and token rewards are speculative and may have no guaranteed monetary
                  value.
                </li>
                <li>
                  Smart contract risks, protocol vulnerabilities, and regulatory uncertainty are
                  inherent in the digital asset space.
                </li>
              </ul>
              <p>
                <strong className="text-on-surface">
                  Never invest more than you can afford to lose.
                </strong>{' '}
                Ensure you fully understand the risks before participating in any crypto market
                activity.
              </p>
            </div>
          </section>

          {/* ── Accuracy & Limitations ── */}
          <section id="accuracy" className="scroll-mt-24">
            <div className="mb-6 flex items-center gap-3">
              <div className="bg-primary/10 flex size-10 items-center justify-center rounded-xl">
                <CircleAlert className="text-primary size-5" />
              </div>
              <Title as="h2" className="font-bold">
                Accuracy & Limitations
              </Title>
            </div>
            <div className="text-on-surface-variant text-body-lg space-y-4">
              <p>
                While CryptoEdy strives to publish accurate and well-researched content, we make no
                warranties or representations regarding the completeness, accuracy, reliability, or
                suitability of any information on the platform.
              </p>
              <p>
                Market data, prices, and statistics shown on this platform may be delayed or
                inaccurate. Always verify critical data from primary sources before making
                decisions. CryptoEdy reserves the right to update, modify, or remove content at any
                time without notice.
              </p>
            </div>
          </section>

          {/* ── Limitation of Liability ── */}
          <section id="liability" className="scroll-mt-24">
            <div className="mb-6 flex items-center gap-3">
              <div className="bg-primary/10 flex size-10 items-center justify-center rounded-xl">
                <Scale className="text-primary size-5" />
              </div>
              <Title as="h2" className="font-bold">
                Limitation of Liability
              </Title>
            </div>
            <div className="text-on-surface-variant text-body-lg space-y-4">
              <p>
                To the fullest extent permitted by applicable law, CryptoEdy Research and its
                officers, directors, employees, and contributors shall not be liable for any direct,
                indirect, incidental, special, consequential, or punitive damages arising from:
              </p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Your reliance on any content published on this platform</li>
                <li>Any investment or trading decisions you make based on our content</li>
                <li>Any loss or damage to your assets, including cryptocurrency holdings</li>
                <li>Any errors, omissions, or inaccuracies in our published content</li>
              </ul>
              <p>
                By using CryptoEdy Research, you acknowledge that you have read, understood, and
                agreed to this disclaimer in its entirety.
              </p>
            </div>
          </section>
        </main>
      </div>
    </GuestPage>
  )
}
