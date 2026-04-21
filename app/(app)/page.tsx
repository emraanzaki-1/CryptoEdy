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
