import { Lightbulb, TrendingUp, Globe, ShieldCheck } from 'lucide-react'

const VALUE_PROPS = [
  {
    icon: Lightbulb,
    title: 'High-Conviction Picks',
    description:
      'Carefully curated investment opportunities with strong upside potential, cutting through market noise.',
    color: 'text-primary',
  },
  {
    icon: TrendingUp,
    title: 'Expert Technical Analysis',
    description:
      'Deep-dive chart analysis utilizing institutional frameworks to identify critical entry and exit points.',
    color: 'text-primary',
  },
  {
    icon: Globe,
    title: 'Macro Analysis',
    description:
      'Understand the broader economic trends and liquidity cycles directly impacting the digital asset market.',
    color: 'text-primary',
  },
  {
    icon: ShieldCheck,
    title: '3X Value Guarantee',
    description:
      'We stand by our research. We guarantee our insights will provide at least 3x the value of your subscription.',
    color: 'text-secondary',
  },
] as const

export function ValuePropsSection() {
  return (
    <div className="bg-surface-container-low @container mt-8 flex flex-col gap-12 rounded-xl px-4 py-16">
      <div className="flex flex-col gap-4">
        <h2 className="text-on-surface max-w-[720px] text-[32px] leading-tight font-black tracking-[-0.04em] @[480px]:text-[40px]">
          The CryptoEdy Advantage
        </h2>
        <p className="text-on-surface-variant max-w-[720px] text-base leading-relaxed font-normal">
          Unlock an edge in the market with our comprehensive research suite, built on tonal clarity
          and analytical rigor.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {VALUE_PROPS.map((prop) => (
          <div
            key={prop.title}
            className="bg-surface-container-lowest flex flex-1 flex-col gap-4 rounded-xl p-6 shadow-[0_16px_32px_-12px_rgba(11,28,48,0.04)]"
          >
            <div className={`text-3xl ${prop.color}`}>
              <prop.icon className="size-8" />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-on-surface text-lg leading-tight font-bold">{prop.title}</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed font-normal">
                {prop.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
