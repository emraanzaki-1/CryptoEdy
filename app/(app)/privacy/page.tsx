import Link from 'next/link'
import { Database, Shield, Cookie, Scale, CircleCheck } from 'lucide-react'
import { GuestShell } from '@/components/layouts/guest-shell'
import { SidebarNav } from '@/components/common/sidebar-nav'

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
    <GuestShell className="max-w-site mx-auto w-full px-4 pt-16 pb-24 md:px-8">
      {/* ── Hero Header ── */}
      <header className="mb-20">
        <div className="bg-surface-container text-primary text-overline mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1 font-bold tracking-[0.05em] uppercase">
          <Shield className="size-3.5" />
          Legal Framework
        </div>
        <h1 className="text-headline-lg text-on-surface mb-8 font-black">Privacy Policy</h1>
        <p className="text-on-surface-variant max-w-3xl text-lg leading-relaxed font-medium">
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
              <h2 className="text-headline text-on-surface font-bold">Data Collection</h2>
            </div>
            <div className="bg-surface-container-lowest space-y-6 rounded-xl p-8">
              <p className="text-on-surface-variant leading-relaxed">
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
              <h2 className="text-headline text-on-surface font-bold">Data Security</h2>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="bg-surface-container-low rounded-xl p-8">
                <h3 className="mb-4 text-xl font-bold">Encryption Standards</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  We implement industry-standard security measures to protect your information,
                  including encryption in transit and at rest. We do not sell your personal
                  information to third parties.
                </p>
              </div>
              <div className="bg-primary text-on-primary shadow-primary/10 rounded-xl p-8 shadow-xl">
                <h3 className="mb-4 text-xl font-bold">Third-Party Providers</h3>
                <p className="text-sm leading-relaxed opacity-90">
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
              <h2 className="text-headline text-on-surface font-bold">Cookie Usage</h2>
            </div>
            <div className="bg-surface-container-lowest border-outline-variant/15 overflow-hidden rounded-xl border">
              <table className="w-full text-left">
                <thead className="bg-surface-container-low">
                  <tr>
                    <th className="text-on-surface-variant text-overline px-6 py-4 font-black tracking-[0.05em] uppercase">
                      Type
                    </th>
                    <th className="text-on-surface-variant text-overline px-6 py-4 font-black tracking-[0.05em] uppercase">
                      Purpose
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-outline-variant/10 divide-y">
                  <tr>
                    <td className="px-6 py-6 text-sm font-bold">Essential</td>
                    <td className="text-on-surface-variant px-6 py-6 text-sm leading-relaxed">
                      Maintaining secure session states and authentication tokens. Required for the
                      Service to function.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-6 text-sm font-bold">Performance</td>
                    <td className="text-on-surface-variant px-6 py-6 text-sm leading-relaxed">
                      Aggregated, anonymous analytics to optimize platform performance and
                      understand usage patterns.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-6 text-sm font-bold">Preference</td>
                    <td className="text-on-surface-variant px-6 py-6 text-sm leading-relaxed">
                      Remembering your settings such as theme, notification preferences, and content
                      display choices.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-on-surface-variant mt-4 text-sm">
              You can manage cookie settings through your browser. Disabling cookies may affect some
              features of the Service.
            </p>
          </section>

          {/* S4 — Your Rights */}
          <section id="rights" className="scroll-mt-32">
            <div className="mb-8 flex items-center gap-4">
              <Scale className="text-primary size-7" />
              <h2 className="text-headline text-on-surface font-bold">Your Rights</h2>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="bg-surface-container-low rounded-xl p-6">
                <h4 className="mb-2 font-bold">Access</h4>
                <p className="text-on-surface-variant text-xs">
                  Request a full copy of all personal data we hold about you, delivered in a
                  structured, portable format.
                </p>
              </div>
              <div className="bg-surface-container-low rounded-xl p-6">
                <h4 className="mb-2 font-bold">Rectify</h4>
                <p className="text-on-surface-variant text-xs">
                  Correct inaccurate or incomplete personal information associated with your account
                  at any time.
                </p>
              </div>
              <div className="bg-surface-container-low rounded-xl p-6">
                <h4 className="mb-2 font-bold">Erasure</h4>
                <p className="text-on-surface-variant text-xs">
                  Request deletion of your account and all associated personal data. We retain data
                  only as long as your account is active or as legally required.
                </p>
              </div>
            </div>
            <p className="text-on-surface-variant mt-6 text-sm leading-relaxed">
              The Service is not intended for users under the age of 18. We do not knowingly collect
              personal information from children. Your information may be transferred
              internationally with appropriate safeguards in place.
            </p>
          </section>

          {/* Bottom CTA */}
          <div className="border-outline-variant/30 border-t pt-12 text-center">
            <p className="text-outline text-sm font-medium">
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
    </GuestShell>
  )
}
