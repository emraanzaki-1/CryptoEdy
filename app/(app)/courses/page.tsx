import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { GuestShell } from '@/components/layouts/guest-shell'
import { getNavCategories } from '@/lib/categories/getCategories'
import { LAYOUT } from '@/lib/config/layout'
import { CoursesHero } from '@/components/education/courses-hero'
import { CoursesCurriculum } from '@/components/education/courses-curriculum'
import { ProBenefitsSection } from '@/components/education/pro-benefits-section'
import { ConversionCTA } from '@/components/education/conversion-cta'
import { FAQSection } from '@/components/landing/faq-section'

export const metadata: Metadata = {
  title: 'Trading Courses — CryptoEdy',
  description:
    'Master the digital economy with structured trading courses. From beginner fundamentals to advanced strategies.',
  alternates: {
    canonical: `${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/courses`,
  },
}

export default async function CoursesPage() {
  const navCategories = await getNavCategories()

  let courses: {
    id: string | number
    title: string
    slug: string
    excerpt: string
    difficulty: string
    estimatedDuration?: string | null
    isProOnly?: boolean
  }[] = []

  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'courses',
      where: { status: { equals: 'published' } },
      sort: 'order',
      limit: 20,
      depth: 1,
      overrideAccess: true,
    })

    courses = result.docs.map((doc) => ({
      id: doc.id,
      title: doc.title,
      slug: doc.slug,
      excerpt: doc.excerpt,
      difficulty: doc.difficulty,
      estimatedDuration: doc.estimatedDuration ?? null,
      isProOnly: doc.isProOnly ?? false,
    }))
  } catch {
    // Render with empty courses — graceful degradation
  }

  return (
    <GuestShell navCategories={navCategories}>
      <CoursesHero />

      <div className={`flex flex-1 justify-center ${LAYOUT.guest.px}`}>
        <div className="max-w-site flex flex-1 flex-col gap-16 py-16">
          <CoursesCurriculum courses={courses} />
          <ProBenefitsSection />
          <ConversionCTA />
          <FAQSection
            slug="education"
            heading="Learn with confidence."
            subtitle="Have questions about the academy? We're here to help."
          />
        </div>
      </div>
    </GuestShell>
  )
}
