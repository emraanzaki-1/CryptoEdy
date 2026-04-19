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
    <div className="bg-surface relative flex min-h-screen w-full flex-col overflow-x-clip">
      {/* Full-width nav */}
      <div className="bg-surface-container-highest/80 sticky top-0 z-50 w-full backdrop-blur-md">
        <div className="mx-auto max-w-[1200px] px-4 md:px-8">
          <GuestNav />
        </div>
      </div>

      {/* Full-width hero */}
      <HeroSection />

      {/* Content sections */}
      <div className="flex flex-1 justify-center px-4 md:px-8">
        <main className="flex max-w-[1200px] flex-1 flex-col gap-16 py-16">
          <ValuePropsSection />
          <ResearchPreviewSection />
          <TrackRecordSection />
          <PricingSection />
          <FAQSection />
        </main>
      </div>

      <Footer />
    </div>
  )
}
