import { ButtonLink } from '@/components/ui/button-link'
import { Display } from '@/components/ui/typography'
import { LAYOUT } from '@/lib/config/layout'

export function CoursesHero() {
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className={`relative z-10 mx-auto max-w-3xl text-center ${LAYOUT.guest.px}`}>
        <Display responsive className="text-on-surface mb-6">
          Master the <span className="text-primary">Digital Economy</span>
        </Display>
        <p className="text-on-surface-variant text-body-lg mx-auto mb-10 max-w-2xl">
          Institutional-grade intelligence and rigorous educational frameworks for the modern
          digital asset researcher.
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <ButtonLink
            href="/register"
            variant="gradient"
            size="xl"
            className="min-w-[160px] shadow-lg hover:-translate-y-1"
          >
            Start Learning
          </ButtonLink>
          <ButtonLink href="/login" variant="tonal" size="xl" className="min-w-[160px]">
            Log In
          </ButtonLink>
        </div>
      </div>

      {/* Decorative blurred circles */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-30">
        <div className="bg-primary-fixed absolute top-1/4 left-1/4 size-96 rounded-full mix-blend-multiply blur-3xl dark:opacity-20 dark:mix-blend-normal" />
        <div className="bg-surface-dim absolute right-1/4 bottom-1/4 size-96 rounded-full mix-blend-multiply blur-3xl dark:opacity-20 dark:mix-blend-normal" />
      </div>
    </section>
  )
}
