import Link from 'next/link'
import { Database, Shield, Cookie, Scale, CircleCheck } from 'lucide-react'
import { GuestPage } from '@/components/layouts/guest-shell'
import { SidebarNav } from '@/components/common/sidebar-nav'
import { Heading, Title } from '@/components/ui/typography'

export const metadata = {
  title: 'Privacy Policy – CryptoEdy',
  description: 'Privacy Policy for CryptoEdy Research.',
}

const sidebarLinks = [
  { id: 'collection', num: '01', label: 'Data Collection' },
  { id: 'security', num: '02', label: 'Data Security' },
  { id: 'cookies', num: '03', label: 'Cookie Usage' },
  { id: 'rights', num: '04', label: 'Your Rights' },
]

export default function PrivacyPage() {
  return (
    <GuestPage>
      {/* ── Hero Header ── */}
      <header className="mb-20">
        <div className="bg-surface-container text-primary text-overline mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1 font-bold uppercase">
          <Shield className="size-3.5" />
          Legal Framework
        </div>
        <Heading as="h1" size="lg" className="mb-8 font-black">
          Privacy Policy
        </Heading>
        <p className="text-on-surface-variant text-subtitle max-w-3xl font-medium">
          Ensuring institutional-grade data security and absolute transparency in the CryptoEdy
          digital ecosystem. Last updated: April 20, 2026.
        </p>
      </header>

      {/* ── 12-col Grid: Sidebar + Content ── */}
      <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
        {/* Sticky Sidebar Nav */}
        <SidebarNav links={sidebarLinks} />

        {/* Main Content */}
        <article className="space-y-24 lg:col-span-9">
          {/* S1 — Data Collection */}
          <section id="collection" className="scroll-mt-32">
            <div className="mb-8 flex items-center gap-4">
              <Database className="text-primary size-7" />
              <Heading className="font-black">Data Collection</Heading>
            </div>
            <div className="bg-surface-container-lowest space-y-6 rounded-xl p-8">
              <p className="text-on-surface-variant text-body">
                At CryptoEdy, we prioritize your privacy. We collect minimal personal information
                necessary to provide our research and analysis services. This typically includes:
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CircleCheck className="text-secondary mt-1 size-5 shrink-0" />
                  <span className="text-on-surface">
                    <strong>Account Information:</strong> Email addresses, display names, and
                    account preferences provided during registration or profile updates.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CircleCheck className="text-secondary mt-1 size-5 shrink-0" />
                  <span className="text-on-surface">
                    <strong>Usage Analytics:</strong> Pages viewed, features used, and interaction
                    patterns — collected automatically to improve the Service.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CircleCheck className="text-secondary mt-1 size-5 shrink-0" />
                  <span className="text-on-surface">
                    <strong>Communications:</strong> Messages sent through our contact form or
                    support channels, used solely to respond to your inquiries.
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* S2 — Data Security */}
          <section id="security" className="scroll-mt-32">
            <div className="mb-8 flex items-center gap-4">
              <Shield className="text-primary size-7" />
              <Heading className="font-black">Data Security</Heading>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="bg-surface-container-low rounded-xl p-8">
                <Title as="h3" className="mb-4">
                  Encryption Standards
                </Title>
                <p className="text-on-surface-variant text-body-sm">
                  We implement industry-standard security measures to protect your information,
                  including encryption in transit and at rest. We do not sell your personal
                  information to third parties.
                </p>
              </div>
              <div className="bg-primary text-on-primary shadow-primary/10 rounded-xl p-8 shadow-xl">
                <Title as="h3" className="mb-4">
                  Third-Party Providers
                </Title>
                <p className="text-body-sm opacity-90">
                  We may share data with trusted service providers who assist in operating the
                  Service (e.g., payment processing, email delivery, analytics). These providers are
                  bound by confidentiality obligations.
                </p>
              </div>
            </div>
          </section>

          {/* S3 — Cookies & Tracking */}
          <section id="cookies" className="scroll-mt-32">
            <div className="mb-8 flex items-center gap-4">
              <Cookie className="text-primary size-7" />
              <Heading className="font-black">Cookie Usage</Heading>
            </div>
            <div className="bg-surface-container-lowest border-outline-variant/15 overflow-x-auto rounded-xl border">
              <table className="w-full text-left">
                <thead className="bg-surface-container-low">
                  <tr>
                    <th className="text-on-surface-variant text-overline px-6 py-4 font-black uppercase">
                      Type
                    </th>
                    <th className="text-on-surface-variant text-overline px-6 py-4 font-black uppercase">
                      Purpose
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-outline-variant/10 divide-y">
                  <tr>
                    <td className="text-body-sm px-6 py-6 font-bold">Essential</td>
                    <td className="text-on-surface-variant text-body-sm px-6 py-6">
                      Maintaining secure session states and authentication tokens. Required for the
                      Service to function.
                    </td>
                  </tr>
                  <tr>
                    <td className="text-body-sm px-6 py-6 font-bold">Performance</td>
                    <td className="text-on-surface-variant text-body-sm px-6 py-6">
                      Aggregated, anonymous analytics to optimize platform performance and
                      understand usage patterns.
                    </td>
                  </tr>
                  <tr>
                    <td className="text-body-sm px-6 py-6 font-bold">Preference</td>
                    <td className="text-on-surface-variant text-body-sm px-6 py-6">
                      Remembering your settings such as theme, notification preferences, and content
                      display choices.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-on-surface-variant text-body-sm mt-4">
              You can manage cookie settings through your browser. Disabling cookies may affect some
              features of the Service.
            </p>
          </section>

          {/* S4 — Your Rights */}
          <section id="rights" className="scroll-mt-32">
            <div className="mb-8 flex items-center gap-4">
              <Scale className="text-primary size-7" />
              <Heading className="font-black">Your Rights</Heading>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="bg-surface-container-low rounded-xl p-6">
                <h4 className="mb-2 font-bold">Access</h4>
                <p className="text-on-surface-variant text-body-sm">
                  Request a full copy of all personal data we hold about you, delivered in a
                  structured, portable format.
                </p>
              </div>
              <div className="bg-surface-container-low rounded-xl p-6">
                <h4 className="mb-2 font-bold">Rectify</h4>
                <p className="text-on-surface-variant text-body-sm">
                  Correct inaccurate or incomplete personal information associated with your account
                  at any time.
                </p>
              </div>
              <div className="bg-surface-container-low rounded-xl p-6">
                <h4 className="mb-2 font-bold">Erasure</h4>
                <p className="text-on-surface-variant text-body-sm">
                  Request deletion of your account and all associated personal data. We retain data
                  only as long as your account is active or as legally required.
                </p>
              </div>
            </div>
            <p className="text-on-surface-variant text-body-sm mt-6">
              The Service is not intended for users under the age of 18. We do not knowingly collect
              personal information from children. Your information may be transferred
              internationally with appropriate safeguards in place.
            </p>
          </section>

          {/* Bottom CTA */}
          <div className="border-outline-variant/30 border-t pt-12 text-center">
            <p className="text-outline text-body-sm font-medium">
              Questions about this policy?{' '}
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
