import { Lightbulb, TrendingUp, Globe, ShieldCheck } from 'lucide-react'
import { SectionHeading } from '@/components/common/section-heading'
import { LAYOUT } from '@/lib/config/layout'

const VALUE_PROPS = [
  {
    icon: Lightbulb,
    title: 'High-Conviction Picks',
    description:
      'Carefully curated investment opportunities with strong upside potential, cutting through market noise.',
  },
  {
    icon: TrendingUp,
    title: 'Expert Technical Analysis',
    description:
      'Deep-dive chart analysis utilizing institutional frameworks to identify critical entry and exit points.',
  },
  {
    icon: Globe,
    title: 'Macro Analysis',
    description:
      'Understand the broader economic trends and liquidity cycles directly impacting the digital asset market.',
  },
  {
    icon: ShieldCheck,
    title: '3x Value Guarantee',
    description:
      'We stand by our research. We guarantee our insights will provide at least 3x the value of your subscription.',
  },
] as const

export function ValuePropsSection() {
  return (
    <section
      className={`bg-surface-container-low flex flex-col gap-12 rounded-2xl ${LAYOUT.spacing.section}`}
    >
      {/* Split header */}
      <SectionHeading
        variant="landing"
        align="split"
        overline="The Advantage"
        subtitle="Your capabilities rival competitors. No weaknesses. So how do we help you find an edge? We provide the research to position early, backed by a team operating since 2022."
      >
        An edge, built on rigor.
      </SectionHeading>

      {/* Cards */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 ${LAYOUT.spacing.gridGap}`}>
        {VALUE_PROPS.map((prop) => (
          <div
            key={prop.title}
            className={`bg-surface-container-lowest shadow-ambient hover:shadow-ambient-hover flex flex-col rounded-2xl transition-all duration-200 hover:-translate-y-0.5 ${LAYOUT.spacing.card} ${LAYOUT.spacing.cardGap}`}
          >
            <div className="bg-primary/8 flex size-11 items-center justify-center rounded-xl">
              <prop.icon className="text-primary size-5" />
            </div>
            <div className="flex flex-col gap-1.5">
              <h3 className="text-on-surface text-body-lg leading-tight font-bold">{prop.title}</h3>
              <p className="text-on-surface-variant text-body-sm">{prop.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
