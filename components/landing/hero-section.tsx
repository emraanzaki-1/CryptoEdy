import Image from 'next/image'
import { ButtonLink } from '@/components/ui/button-link'
import { Display } from '@/components/ui/typography'

const HERO_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDuWmH5pPRQOqtA7h8xEfRxdDasSxUnl5cu8g71R_okh_LUO4zwIaFGbXN0evggqJmlTP4hw3PmmJnaLviE9m4wdCcrxACscuPsiRAGboxKFxQTMLSr5TvbIJMfctlEaDV7RxZ9l3p0AMRcUgFnevihmeCFjdSgejBCOzcvKSLbEfdW3KFPSyhes5esEHm0tRgak-n1ki7Y4b2e03omKFyGi-M5RaSmqdwwen39vnR3dpQZtE2I3wZd3n4V-1u2lRZIrsnRfJtKT1rm'

export function HeroSection() {
  return (
    <div className="relative flex min-h-[480px] flex-col items-center justify-center gap-8 p-8 md:min-h-[540px] md:p-12">
      {/* Background image via next/image */}
      <Image
        src={HERO_IMAGE}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center dark:brightness-[0.3]"
      />
      {/* Gradient overlay */}
      <div
        className="absolute inset-0 dark:hidden"
        style={{
          background:
            'linear-gradient(to bottom, color-mix(in srgb, var(--color-on-surface) 40%, transparent), color-mix(in srgb, var(--color-primary) 60%, transparent))',
        }}
      />
      {/* Dark mode overlay */}
      <div className="absolute inset-0 hidden bg-[#0B1C30]/80 dark:block" />
      <div className="relative z-10 flex max-w-3xl flex-col gap-4 text-center">
        <Display responsive className="text-on-primary dark:text-white">
          Institutional-Grade Crypto Research for the Modern Investor
        </Display>
        <p className="text-inverse-primary text-body-lg md:text-subtitle dark:text-on-surface-variant mx-auto max-w-2xl font-normal">
          Actionable insights, high-conviction picks, and expert analysis designed to cut through
          the noise and deliver measurable edge.
        </p>
      </div>
      <div className="relative z-10 mt-2 flex w-full flex-col justify-center gap-4 px-4 sm:w-auto sm:flex-row sm:px-0">
        <ButtonLink
          href="/register"
          variant="gradient"
          size="xl"
          className="min-w-[140px] shadow-lg hover:-translate-y-1"
        >
          Join CryptoEdy Pro
        </ButtonLink>
        <ButtonLink
          href="/research"
          variant="outline"
          size="xl"
          className="border-on-primary/30 bg-surface-container-lowest/10 text-on-primary hover:bg-surface-container-lowest/20 hover:text-on-primary dark:border-outline-variant dark:bg-surface-container/50 dark:text-on-surface dark:hover:bg-surface-container/80 min-w-[140px] border-2 backdrop-blur-sm hover:-translate-y-1 dark:hover:text-white"
        >
          Explore Free Analysis
        </ButtonLink>
      </div>
    </div>
  )
}
