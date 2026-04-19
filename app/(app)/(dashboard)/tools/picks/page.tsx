import { TrendingUp, Target, Star, RefreshCw, Zap } from 'lucide-react'

const HIGHLIGHTS = [
  {
    icon: Target,
    title: 'High-Conviction Picks',
    description:
      'Curated token selections with clear entry zones, targets, and invalidation levels.',
  },
  {
    icon: Star,
    title: 'Proprietary Scoring',
    description: 'Each asset scored across fundamentals, technicals, and on-chain metrics.',
  },
  {
    icon: RefreshCw,
    title: 'Weekly Updates',
    description: 'Refreshed every week by our core editorial research team with full write-ups.',
  },
] as const

export default function PicksPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        {/* Text */}
        <div className="flex flex-col gap-6">
          <div>
            <span className="bg-secondary-container text-on-secondary-container text-overline mb-4 inline-block rounded-full px-3 py-1 font-bold uppercase">
              Coming Soon
            </span>
            <h1 className="text-on-surface text-headline lg:text-headline-lg mb-4 font-black">
              Assets & <span className="text-tertiary">Picks.</span>
            </h1>
            <p className="text-on-surface-variant max-w-md text-base leading-relaxed">
              A proprietary scoring system for underlying assets, updated weekly by our core
              research editorial team. No noise — only high-conviction plays.
            </p>
          </div>

          <div className="flex flex-col gap-5">
            {HIGHLIGHTS.map((h) => (
              <div key={h.title} className="flex items-start gap-4">
                <div className="bg-surface-container-high text-tertiary flex size-10 shrink-0 items-center justify-center rounded-xl">
                  <h.icon className="size-5" />
                </div>
                <div>
                  <h3 className="text-on-surface text-sm font-bold">{h.title}</h3>
                  <p className="text-on-surface-variant mt-0.5 text-sm">{h.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visual */}
        <div className="relative">
          <div className="bg-surface-container-low relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl">
            <div className="from-tertiary/10 absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_var(--tw-gradient-stops))] via-transparent to-transparent" />
            <div className="bg-tertiary-container/20 absolute -right-8 -bottom-8 size-48 rounded-full blur-3xl" />

            {/* Simulated ranking bars */}
            <div className="absolute bottom-1/4 left-1/4 flex items-end gap-3 opacity-15">
              <div className="bg-tertiary h-16 w-6 rounded-t-lg" />
              <div className="bg-tertiary h-24 w-6 rounded-t-lg" />
              <div className="bg-tertiary h-12 w-6 rounded-t-lg" />
              <div className="bg-tertiary h-20 w-6 rounded-t-lg" />
              <div className="bg-tertiary h-8 w-6 rounded-t-lg" />
            </div>

            <div className="relative flex flex-col items-center gap-4">
              <div className="bg-surface-container-lowest shadow-tertiary/10 flex size-20 items-center justify-center rounded-3xl shadow-xl">
                <TrendingUp className="text-tertiary size-10" strokeWidth={1.2} />
              </div>
              <div className="flex gap-2">
                <div className="bg-tertiary/20 h-1.5 w-10 animate-pulse rounded-full [animation-duration:2s]" />
                <div className="bg-tertiary/10 h-1.5 w-20 animate-pulse rounded-full [animation-delay:0.3s] [animation-duration:2s]" />
                <div className="bg-tertiary/5 h-1.5 w-6 animate-pulse rounded-full [animation-delay:0.6s] [animation-duration:2s]" />
              </div>
            </div>
          </div>

          {/* Floating status badge */}
          <div className="bg-surface-container-lowest shadow-primary/5 absolute -bottom-4 -left-4 hidden items-center gap-3 rounded-2xl p-3 shadow-xl md:flex">
            <div className="bg-secondary text-on-secondary flex size-9 items-center justify-center rounded-full">
              <Zap className="size-4" />
            </div>
            <div>
              <p className="text-on-surface-variant text-overline font-bold uppercase">Status</p>
              <p className="text-on-surface text-sm font-bold">Coming Soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
