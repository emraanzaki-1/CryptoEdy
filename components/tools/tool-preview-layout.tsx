import { Zap, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Heading } from '@/components/ui/typography'

type Highlight = {
  icon: LucideIcon
  title: string
  description: string
}

type AccentColor = 'primary' | 'secondary' | 'tertiary'

type ToolPreviewLayoutProps = {
  title: React.ReactNode
  description: string
  highlights: readonly Highlight[]
  icon: LucideIcon
  accent: AccentColor
  /** Extra decorative elements rendered inside the visual panel */
  decoration?: React.ReactNode
  actions?: React.ReactNode
}

const accentMap = {
  primary: {
    text: 'text-primary',
    gradient: 'from-primary/10',
    orb: 'bg-primary-container/20',
    pulse: ['bg-primary/20', 'bg-primary/10', 'bg-primary/5'] as const,
    shadow: 'shadow-primary/10',
  },
  secondary: {
    text: 'text-secondary',
    gradient: 'from-secondary/10',
    orb: 'bg-secondary-container/20',
    pulse: ['bg-secondary/20', 'bg-secondary/10', 'bg-secondary/5'] as const,
    shadow: 'shadow-secondary/10',
  },
  tertiary: {
    text: 'text-tertiary',
    gradient: 'from-tertiary/10',
    orb: 'bg-tertiary-container/20',
    pulse: ['bg-tertiary/20', 'bg-tertiary/10', 'bg-tertiary/5'] as const,
    shadow: 'shadow-tertiary/10',
  },
} as const

export function ToolPreviewLayout({
  title,
  description,
  highlights,
  icon: Icon,
  accent,
  decoration,
  actions,
}: ToolPreviewLayoutProps) {
  const s = accentMap[accent]

  return (
    <div className="mx-auto max-w-5xl">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        {/* Text */}
        <div className="flex flex-col gap-6">
          <div>
            <span className="bg-secondary-container text-on-secondary-container text-overline mb-4 inline-block rounded-full px-3 py-1 font-bold uppercase">
              Coming Soon
            </span>
            <Heading as="h1" className="lg:text-headline-lg mb-4 font-black">
              {title}
            </Heading>
            <p className="text-on-surface-variant text-body-lg max-w-md">{description}</p>
          </div>

          <div className="flex flex-col gap-6">
            {highlights.map((h) => (
              <div key={h.title} className="flex items-start gap-4">
                <div
                  className={cn(
                    'bg-surface-container-high flex size-10 shrink-0 items-center justify-center rounded-xl',
                    s.text
                  )}
                >
                  <h.icon className="size-5" />
                </div>
                <div>
                  <h3 className="text-on-surface text-body-sm font-bold">{h.title}</h3>
                  <p className="text-on-surface-variant text-body-sm mt-0.5">{h.description}</p>
                </div>
              </div>
            ))}
          </div>

          {actions}
        </div>

        {/* Visual */}
        <div className="relative">
          <div className="bg-surface-container-low relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl">
            <div
              className={cn(
                'absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_var(--tw-gradient-stops))] via-transparent to-transparent',
                s.gradient
              )}
            />
            <div
              className={cn('absolute -right-8 -bottom-8 size-48 rounded-full blur-3xl', s.orb)}
            />

            {decoration}

            <div className="relative flex flex-col items-center gap-4">
              <div
                className={cn(
                  'bg-surface-container-lowest flex size-20 items-center justify-center rounded-3xl shadow-xl',
                  s.shadow
                )}
              >
                <Icon className={cn('size-10', s.text)} strokeWidth={1.2} />
              </div>
              <div className="flex gap-2">
                <div
                  className={cn(
                    'h-1.5 w-10 animate-pulse rounded-full [animation-duration:2s]',
                    s.pulse[0]
                  )}
                />
                <div
                  className={cn(
                    'h-1.5 w-20 animate-pulse rounded-full [animation-delay:0.3s] [animation-duration:2s]',
                    s.pulse[1]
                  )}
                />
                <div
                  className={cn(
                    'h-1.5 w-6 animate-pulse rounded-full [animation-delay:0.6s] [animation-duration:2s]',
                    s.pulse[2]
                  )}
                />
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
