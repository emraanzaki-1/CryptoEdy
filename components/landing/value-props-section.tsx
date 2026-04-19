import { Lightbulb, TrendingUp, Globe, ShieldCheck } from 'lucide-react'

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
    <section className="bg-surface-container-low flex flex-col gap-12 rounded-2xl px-6 py-14 md:px-10">
      {/* Split header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-3 md:max-w-md">
          <span className="text-primary text-xs font-semibold tracking-[0.05em] uppercase">
            The Advantage
          </span>
          <h2 className="font-headline text-on-surface text-headline md:text-headline-md font-black">
            An edge, built on rigor.
          </h2>
        </div>
        <p className="text-on-surface-variant max-w-sm text-sm leading-relaxed">
          Your capabilities rival competitors. No weaknesses. So how do we help you find an edge? We
          provide the research to position early, backed by a team operating since 2022.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {VALUE_PROPS.map((prop) => (
          <div
            key={prop.title}
            className="bg-surface-container-lowest flex flex-col gap-4 rounded-2xl p-6 shadow-[0_16px_32px_-12px_rgba(11,28,48,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-8px_rgba(11,28,48,0.06)]"
          >
            <div className="bg-primary/8 flex size-11 items-center justify-center rounded-xl">
              <prop.icon className="text-primary size-5" />
            </div>
            <div className="flex flex-col gap-1.5">
              <h3 className="text-on-surface text-base leading-tight font-bold">{prop.title}</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">{prop.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
