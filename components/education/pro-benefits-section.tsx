import { CheckCircle, Diamond } from 'lucide-react'
import { SectionHeading } from '@/components/common/section-heading'
import { LAYOUT } from '@/lib/config/layout'

const BENEFITS = [
  {
    title: 'Expert Mentorship',
    description: 'Direct access to seasoned analysts for portfolio review.',
  },
  {
    title: 'On-Demand TA',
    description: 'Request bespoke technical analysis on specific assets.',
  },
  {
    title: 'Weekly Alpha Livestreams',
    description: 'Real-time market breakdown and strategy sessions.',
  },
  {
    title: 'Private Research Library',
    description: 'Unrestricted access to the full archive of institutional reports.',
  },
] as const

export function ProBenefitsSection() {
  return (
    <section
      className={`flex flex-col gap-16 lg:flex-row lg:items-center ${LAYOUT.spacing.section}`}
    >
      {/* Left — copy */}
      <div className="flex flex-1 flex-col gap-6">
        <div className="bg-tertiary-fixed text-on-tertiary-fixed-variant text-overline inline-flex w-fit items-center gap-1.5 rounded-full px-4 py-1.5 font-bold uppercase">
          Pro Tier
        </div>

        <SectionHeading variant="landing">The Pro Advantage</SectionHeading>

        <p className="text-on-surface-variant text-body-lg max-w-md">
          Elevate your research capabilities with direct access to institutional tools and expert
          analysis.
        </p>

        <ul className="mt-4 space-y-6">
          {BENEFITS.map((benefit) => (
            <li key={benefit.title} className="flex items-start gap-4">
              <div className="bg-secondary-fixed/20 text-secondary mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full">
                <CheckCircle className="size-4" />
              </div>
              <div>
                <h4 className="text-on-surface text-body-sm font-bold">{benefit.title}</h4>
                <p className="text-on-surface-variant text-body-sm">{benefit.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Right — decorative card composition */}
      <div className="hidden flex-1 lg:block">
        <div className="bg-surface-container-high border-outline-variant/15 shadow-ambient relative aspect-square overflow-hidden rounded-[2rem] border p-8">
          <div className="from-tertiary-fixed/20 absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] via-transparent to-transparent" />
          <div className="bg-surface-container-lowest border-outline-variant/15 shadow-ambient relative flex h-full w-full flex-col justify-between rounded-xl border p-6">
            <div className="bg-tertiary-fixed/20 text-tertiary flex size-16 items-center justify-center rounded-full">
              <Diamond className="size-8" />
            </div>
            <div>
              <div className="bg-surface-container-high mb-3 h-4 w-3/4 rounded" />
              <div className="bg-surface-container-high mb-6 h-4 w-1/2 rounded" />
              <div className="space-y-2">
                <div className="bg-surface-container h-2 w-full rounded" />
                <div className="bg-surface-container h-2 w-full rounded" />
                <div className="bg-surface-container h-2 w-4/5 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
