import { Gift, CheckCircle, BookOpen, Bell, Zap } from 'lucide-react'

const HIGHLIGHTS = [
  {
    icon: CheckCircle,
    title: 'Eligibility Checker',
    description: 'Connect your wallet and instantly see which upcoming airdrops you qualify for.',
  },
  {
    icon: BookOpen,
    title: 'Step-by-Step Guides',
    description: 'Detailed walkthroughs for each ecosystem — never miss a critical interaction.',
  },
  {
    icon: Bell,
    title: 'Deadline Alerts',
    description: 'Get notified before snapshot dates and claim windows close.',
  },
] as const

export default function AirdropsPage() {
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
              Airdrop <span className="text-secondary">Hub.</span>
            </h1>
            <p className="text-on-surface-variant max-w-md text-base leading-relaxed">
              Automated eligibility checks and step-by-step guides for the most promising
              ecosystems. Stop guessing — know exactly where to position.
            </p>
          </div>

          <div className="flex flex-col gap-5">
            {HIGHLIGHTS.map((h) => (
              <div key={h.title} className="flex items-start gap-4">
                <div className="bg-surface-container-high text-secondary flex size-10 shrink-0 items-center justify-center rounded-xl">
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
            <div className="from-secondary/10 absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_var(--tw-gradient-stops))] via-transparent to-transparent" />
            <div className="bg-secondary-container/20 absolute -right-8 -bottom-8 size-48 rounded-full blur-3xl" />

            <div className="relative flex flex-col items-center gap-4">
              <div className="bg-surface-container-lowest shadow-secondary/10 flex size-20 items-center justify-center rounded-3xl shadow-xl">
                <Gift className="text-secondary size-10" strokeWidth={1.2} />
              </div>
              <div className="flex gap-2">
                <div className="bg-secondary/20 h-1.5 w-10 animate-pulse rounded-full [animation-duration:2s]" />
                <div className="bg-secondary/10 h-1.5 w-20 animate-pulse rounded-full [animation-delay:0.3s] [animation-duration:2s]" />
                <div className="bg-secondary/5 h-1.5 w-6 animate-pulse rounded-full [animation-delay:0.6s] [animation-duration:2s]" />
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
