import { Lightbulb, AlertTriangle, CheckCircle, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'

const VARIANTS = {
  insight: {
    icon: Lightbulb,
    bg: 'bg-primary/5',
    border: 'border-primary/20',
    iconColor: 'text-primary',
    headingColor: 'text-primary',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-error/5',
    border: 'border-error/20',
    iconColor: 'text-error',
    headingColor: 'text-error',
  },
  tip: {
    icon: CheckCircle,
    bg: 'bg-secondary/5',
    border: 'border-secondary/20',
    iconColor: 'text-secondary',
    headingColor: 'text-secondary',
  },
  data: {
    icon: BarChart3,
    bg: 'bg-tertiary/5',
    border: 'border-tertiary/20',
    iconColor: 'text-tertiary',
    headingColor: 'text-tertiary',
  },
} as const

interface CalloutBlockProps {
  type: keyof typeof VARIANTS
  heading?: string | null
  body: string
}

export function CalloutBlockComponent({ type, heading, body }: CalloutBlockProps) {
  const variant = VARIANTS[type] ?? VARIANTS.insight
  const Icon = variant.icon

  return (
    <aside className={cn('my-8 flex gap-4 rounded-xl border p-6', variant.bg, variant.border)}>
      <Icon className={cn('mt-0.5 size-5 shrink-0', variant.iconColor)} />
      <div className="min-w-0">
        {heading && (
          <p className={cn('text-body-sm mb-1 font-bold', variant.headingColor)}>{heading}</p>
        )}
        <p className="text-on-surface-variant text-body-sm">{body}</p>
      </div>
    </aside>
  )
}
