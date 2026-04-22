import type { Metadata } from 'next'
import { GuestShell } from '@/components/layouts/guest-shell'
import { getNavCategories } from '@/lib/categories/getCategories'
import { LAYOUT } from '@/lib/config/layout'
import { HeroSection } from '@/components/landing/hero-section'
import { ValuePropsSection } from '@/components/landing/value-props-section'
import { ResearchPreviewSection } from '@/components/landing/research-preview-section'
import { TrackRecordSection } from '@/components/landing/track-record-section'
import { PricingSection } from '@/components/landing/pricing-section'
import { FAQSection } from '@/components/landing/faq-section'
import { OnboardingPopup } from '@/components/landing/onboarding-popup'

export const metadata: Metadata = {
  title: 'CryptoEdy — Premium Crypto Research & Analysis',
  description:
    'Access high-conviction token picks, macro analysis, and airdrop guides. Join 300,000+ investors.',
  alternates: { canonical: process.env.NEXTAUTH_URL ?? 'http://localhost:3000' },
  openGraph: {
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CryptoEdy — Premium Crypto Research & Analysis',
      },
    ],
  },
}

export default async function Home() {
  const navCategories = await getNavCategories()

  return (
    <GuestShell navCategories={navCategories}>
      {/* Full-width hero */}
      <HeroSection />

      {/* Content sections */}
      <div className={`flex flex-1 justify-center ${LAYOUT.guest.px}`}>
        <div className="max-w-site flex flex-1 flex-col gap-16 py-16">
          <ValuePropsSection />
          <ResearchPreviewSection />
          <TrackRecordSection />
          <PricingSection />
          <FAQSection />
        </div>
      </div>

      {/* Email capture popup for guest users */}
      <OnboardingPopup />
    </GuestShell>
  )
}
