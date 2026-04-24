import { ButtonLink } from '@/components/ui/button-link'
import { Heading } from '@/components/ui/typography'
import { LAYOUT } from '@/lib/config/layout'

export function ConversionCTA() {
  return (
    <section className="from-primary to-primary-container text-on-primary dark:bg-primary-container relative overflow-hidden rounded-2xl bg-gradient-to-b py-24 md:py-32 dark:bg-none dark:text-white">
      {/* Decorative glow */}
      <div className="bg-primary/20 absolute top-0 right-0 size-64 translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]" />

      <div className={`relative z-10 mx-auto max-w-3xl text-center ${LAYOUT.guest.px}`}>
        <Heading as="h2" size="lg" responsive className="mb-6 font-black">
          Unlock the Academy
        </Heading>
        <p className="text-primary-fixed-dim text-body-lg mx-auto mb-10 max-w-2xl">
          Join the vanguard of digital asset researchers. Register for a free account to begin your
          curriculum.
        </p>
        <ButtonLink
          href="/register"
          variant="outline"
          size="xl"
          className="border-on-primary/30 bg-surface-container-lowest text-primary hover:bg-surface-bright hover:text-primary shadow-xl"
        >
          Create Free Account
        </ButtonLink>
      </div>
    </section>
  )
}
