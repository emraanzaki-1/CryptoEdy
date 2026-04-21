import { Users, ShieldCheck, Bell, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/typography'

const FEATURES = [
  {
    icon: Users,
    title: 'Peer-to-Peer Intelligence',
    description:
      'Engage with verified investors and data scientists in curated discussion threads.',
  },
  {
    icon: ShieldCheck,
    title: 'Vetted Network',
    description:
      'A strictly curated environment for serious digital asset research — no noise, only signal.',
  },
] as const

export default function CommunityPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        {/* Text content */}
        <div className="flex flex-col gap-8">
          <div>
            <span className="bg-secondary-container text-on-secondary-container text-overline mb-4 inline-block rounded-full px-3 py-1 font-bold uppercase">
              Coming Soon
            </span>
            <Heading as="h1" className="lg:text-headline-lg mb-4 font-black">
              The Inner <span className="text-primary">Circle.</span>
            </Heading>
            <p className="text-on-surface-variant text-body-lg max-w-md">
              We&apos;re building a high-fidelity forum and networking space designed exclusively
              for CryptoEdy members. Real-time alpha, vetted insights, and direct access to our
              editorial researchers.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="flex flex-col gap-6">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="flex items-start gap-4">
                <div className="bg-surface-container-high text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
                  <feature.icon className="size-5" />
                </div>
                <div>
                  <h3 className="text-on-surface text-body-sm font-bold">{feature.title}</h3>
                  <p className="text-on-surface-variant text-body-sm mt-0.5">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div>
            <Button variant="gradient" size="xl">
              <Bell className="size-4" />
              Notify Me
            </Button>
          </div>
        </div>

        {/* Visual preview */}
        <div className="relative">
          {/* Background glow */}
          <div className="bg-primary/10 absolute -top-12 -left-12 -z-10 size-64 rounded-full blur-3xl" />
          <div className="bg-secondary-container/20 absolute -right-12 -bottom-12 -z-10 size-64 rounded-full blur-3xl" />

          {/* Glass card */}
          <div className="border-outline-variant/15 shadow-primary/5 bg-surface-container-lowest/70 overflow-hidden rounded-3xl border p-3 shadow-2xl backdrop-blur-2xl">
            {/* Placeholder visual — abstract network representation */}
            <div className="from-primary-container/30 via-surface-container-high to-surface-container-low relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br">
              {/* Decorative nodes */}
              <div className="absolute inset-0 opacity-20">
                <div className="bg-primary absolute top-[30%] left-[20%] size-3 rounded-full" />
                <div className="bg-primary absolute top-[20%] right-[25%] size-2 rounded-full" />
                <div className="bg-secondary absolute bottom-[35%] left-[35%] size-2.5 rounded-full" />
                <div className="bg-primary absolute right-[30%] bottom-[25%] size-2 rounded-full" />
                <div className="bg-primary-container absolute top-[15%] left-[50%] size-4 rounded-full" />
                <div className="bg-secondary-container absolute bottom-[20%] left-[15%] size-3 rounded-full" />
              </div>

              {/* Animated pulse lines */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-15">
                <div className="bg-primary h-px w-3/4 animate-pulse rounded-full [animation-duration:3s]" />
                <div className="bg-primary h-px w-1/2 animate-pulse rounded-full [animation-delay:0.5s] [animation-duration:3s]" />
                <div className="bg-primary h-px w-2/3 animate-pulse rounded-full [animation-delay:1s] [animation-duration:3s]" />
              </div>

              {/* Center icon */}
              <div className="bg-surface-container-lowest shadow-primary/10 relative flex size-20 items-center justify-center rounded-3xl shadow-xl">
                <Users className="text-primary size-10" strokeWidth={1.2} />
              </div>

              {/* Bottom overlay */}
              <div className="from-on-surface/60 absolute inset-x-0 bottom-0 flex flex-col gap-2 bg-gradient-to-t to-transparent p-6 pt-16">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="bg-surface-container-high ring-surface-container-lowest size-7 rounded-full ring-2" />
                    <div className="bg-surface-container ring-surface-container-lowest size-7 rounded-full ring-2" />
                    <div className="bg-surface-container-low ring-surface-container-lowest size-7 rounded-full ring-2" />
                  </div>
                  <span className="text-on-primary/90 text-xs font-medium">
                    Community members waiting
                  </span>
                </div>
                <p className="text-on-primary/60 text-xs italic">
                  &ldquo;The most anticipated feature of the Q4 research cycle.&rdquo;
                </p>
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
              <p className="text-on-surface text-body-sm font-bold">Coming Soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
