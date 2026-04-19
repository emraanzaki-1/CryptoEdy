import Link from 'next/link'
import { Gift, BarChart2, TrendingUp, Layers, ArrowRight } from 'lucide-react'

const TOOLS = [
  {
    href: '/tools/airdrops',
    icon: Gift,
    label: 'Precision',
    labelColor: 'text-secondary',
    accentColor: 'bg-secondary',
    title: 'Airdrop Hub',
    description:
      'Automated eligibility checks and step-by-step guides for the most promising ecosystems in the space.',
  },
  {
    href: '/tools/market-direction',
    icon: BarChart2,
    label: 'Signal',
    labelColor: 'text-primary',
    accentColor: 'bg-primary',
    title: 'Market Direction',
    description:
      'Real-time directional indicators and macro trend analysis to time your entries and exits.',
  },
  {
    href: '/tools/tracker',
    icon: Layers,
    label: 'Agility',
    labelColor: 'text-primary',
    accentColor: 'bg-primary',
    title: 'Portfolio Tracker',
    description:
      'Advanced attribution modeling to understand exactly where your alpha is coming from across DeFi protocols.',
  },
  {
    href: '/tools/picks',
    icon: TrendingUp,
    label: 'Depth',
    labelColor: 'text-tertiary',
    accentColor: 'bg-tertiary',
    title: 'Assets & Picks',
    description:
      'Proprietary scoring system for underlying assets, updated weekly by our core research editorial team.',
  },
] as const

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-10">
        <span className="bg-secondary-container text-on-secondary-container text-overline mb-4 inline-block rounded-full px-3 py-1 font-bold uppercase">
          Coming Soon
        </span>
        <h1 className="text-on-surface mb-4 text-2xl font-bold tracking-[-0.04em] lg:text-3xl">
          Intelligence Tools
        </h1>
        <p className="text-on-surface-variant max-w-xl text-base leading-relaxed">
          We are engineering the next generation of crypto analytics. From real-time airdrop
          tracking to deep-asset databases, our tools are designed for the serious researcher.
        </p>
      </div>

      {/* Tool cards grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {TOOLS.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="bg-surface-container-lowest group hover:shadow-primary/5 relative flex flex-col overflow-hidden rounded-2xl p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            {/* Accent bar */}
            <div className={`${tool.accentColor} absolute top-0 left-0 h-full w-1 rounded-l-2xl`} />

            {/* Label */}
            <span className={`${tool.labelColor} text-overline mb-3 font-bold uppercase`}>
              {tool.label}
            </span>

            {/* Icon + Title */}
            <div className="mb-3 flex items-center gap-3">
              <div className="bg-surface-container-high flex size-10 shrink-0 items-center justify-center rounded-xl">
                <tool.icon className={`size-5 ${tool.labelColor}`} />
              </div>
              <h3 className="text-on-surface text-lg font-bold">{tool.title}</h3>
            </div>

            {/* Description */}
            <p className="text-on-surface-variant mb-4 flex-1 text-sm leading-relaxed">
              {tool.description}
            </p>

            {/* CTA hint */}
            <div className="text-primary flex items-center gap-1 text-sm font-semibold opacity-0 transition-opacity group-hover:opacity-100">
              Learn more <ArrowRight className="size-3.5" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
