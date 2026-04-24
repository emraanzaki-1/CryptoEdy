import Image from 'next/image'
import { BookOpen } from 'lucide-react'
import { ButtonLink } from '@/components/ui/button-link'
import { Display } from '@/components/ui/typography'
import { LAYOUT } from '@/lib/config/layout'

const HERO_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAD2-6O1ptvrDHBSUobw55Ye_ZBYI7GumrPPVyVQojNR1m9ckHu4SdYF2sTz60uJ0ELWGI1P1ysMX_7QzHf31BibUfN_xXMThANXKJjuLBpaxgoUJg5VtmkWGHFm86mwZx1zsYA5h9_JFPdhNWbLxJfM1UnqIV8AP2kFR4zUke9AHshj4fUxYqSgQwRHXdmsKi1xJUOBbNxn8yNHVJpNRDafhHhpYMj1umgcSHAT9o721VUyrhXAvjtDTnQzW_lRLKXWkIMw080RGHx'

export function CryptoSchoolHero() {
  return (
    <section className={LAYOUT.guest.container}>
      <div className="grid grid-cols-1 items-center gap-12 py-16 md:py-24 lg:grid-cols-2 lg:gap-16">
        {/* Left — copy */}
        <div className="flex flex-col gap-6">
          <div className="bg-surface-container text-primary text-overline inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 font-bold uppercase">
            <BookOpen className="size-3.5" />
            The Digital Curator
          </div>

          <Display responsive className="text-on-surface">
            Master the Market with{' '}
            <span className="from-primary to-primary-container dark:from-primary dark:to-primary-container bg-gradient-to-br bg-clip-text text-transparent">
              Crypto School
            </span>
            .
          </Display>

          <p className="text-on-surface-variant text-body-lg max-w-lg">
            Step away from the noise. Dive into an authoritative research journal designed for
            financial intelligence. Learn from experts, grasp the fundamentals, and build your
            conviction.
          </p>

          <div className="mt-2 flex flex-wrap gap-4">
            <ButtonLink
              href="/register"
              variant="gradient"
              size="xl"
              className="min-w-[160px] shadow-lg hover:-translate-y-1"
            >
              Start Learning Free
            </ButtonLink>
            <ButtonLink href="#catalog" variant="tonal" size="xl" className="min-w-[160px]">
              Explore Curriculum
            </ButtonLink>
          </div>
        </div>

        {/* Right — decorative image */}
        <div className="bg-surface-container-low relative hidden aspect-[4/3] overflow-hidden rounded-2xl lg:block">
          <Image
            src={HERO_IMAGE}
            alt="Abstract financial intelligence visualization"
            fill
            sizes="(min-width: 1024px) 50vw, 0vw"
            className="object-cover opacity-80 mix-blend-luminosity dark:opacity-40 dark:mix-blend-normal"
          />
          <div className="from-surface/80 absolute inset-0 bg-gradient-to-tr to-transparent" />
        </div>
      </div>
    </section>
  )
}
