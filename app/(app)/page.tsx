import { GuestNav } from '@/components/layouts/guest-nav'
import { Footer } from '@/components/layouts/footer'
import { HeroSection } from '@/components/landing/hero-section'
import { ValuePropsSection } from '@/components/landing/value-props-section'
import { ResearchPreviewSection } from '@/components/landing/research-preview-section'
import { TrackRecordSection } from '@/components/landing/track-record-section'
import { PricingSection } from '@/components/landing/pricing-section'
import { FAQSection } from '@/components/landing/faq-section'

export default function Home() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <div className="flex h-full grow flex-col">
        <div className="flex flex-1 justify-center px-4 py-5 md:px-8 lg:px-40">
          <div className="flex max-w-[960px] flex-1 flex-col">
            <GuestNav />
            <HeroSection />
            <ValuePropsSection />
            <ResearchPreviewSection />
            <TrackRecordSection />
            <PricingSection />
            <FAQSection />
          </div>
        </div>
        <Footer />
      </div>
    </div>
  )
}
