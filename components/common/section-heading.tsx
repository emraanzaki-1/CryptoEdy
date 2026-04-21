import { cn } from '@/lib/utils'

/* ── Variant style maps ──────────────────────────────────────── */

const headingStyles = {
  page: 'text-on-surface text-headline font-bold',
  landing: 'font-headline text-on-surface text-headline md:text-headline-md font-black',
  subsection: 'text-on-surface text-body-lg font-semibold',
} as const

const subtitleStyles = {
  page: 'text-on-surface-variant text-body-lg mt-1',
  landing: 'text-on-surface-variant text-body-sm max-w-sm',
} as const

type Variant = keyof typeof headingStyles

const defaultTag: Record<Variant, 'h1' | 'h2' | 'h3'> = {
  page: 'h1',
  landing: 'h2',
  subsection: 'h3',
}

/* ── Component ───────────────────────────────────────────────── */

type SectionHeadingProps = {
  as?: 'h1' | 'h2' | 'h3'
  variant?: Variant
  overline?: string
  subtitle?: string
  action?: React.ReactNode
  align?: 'left' | 'split'
  className?: string
  children: React.ReactNode
}

function SectionHeading({
  as,
  variant = 'page',
  overline,
  subtitle,
  action,
  align = 'left',
  className,
  children,
}: SectionHeadingProps) {
  const Tag = as ?? defaultTag[variant]

  /* Subsection — bare heading */
  if (variant === 'subsection') {
    return <Tag className={cn(headingStyles.subsection, 'mb-6', className)}>{children}</Tag>
  }

  const overlineEl = overline && (
    <span className="text-primary text-overline font-bold uppercase">{overline}</span>
  )
  const headingEl = <Tag className={headingStyles[variant]}>{children}</Tag>
  const sKey = variant === 'landing' ? 'landing' : 'page'
  const subtitleEl = subtitle && <p className={subtitleStyles[sKey]}>{subtitle}</p>

  /* Landing split: title left, subtitle + action right */
  if (variant === 'landing' && align === 'split') {
    return (
      <div
        className={cn('flex flex-col gap-6 md:flex-row md:items-end md:justify-between', className)}
      >
        <div className="flex flex-col gap-3">
          {overlineEl}
          {headingEl}
        </div>
        <div className="flex items-end gap-4">
          {subtitleEl}
          {action}
        </div>
      </div>
    )
  }

  /* Any variant with action: flex row */
  if (action) {
    return (
      <div
        className={cn('flex flex-col justify-between gap-4 sm:flex-row sm:items-end', className)}
      >
        <div className={variant === 'landing' ? 'flex flex-col gap-3' : undefined}>
          {overlineEl}
          {headingEl}
          {subtitleEl}
        </div>
        {action}
      </div>
    )
  }

  /* Landing default: stacked with gap */
  if (variant === 'landing') {
    return (
      <div className={cn('flex flex-col gap-3', className)}>
        {overlineEl}
        {headingEl}
        {subtitleEl}
      </div>
    )
  }

  /* Page default: tight stack */
  return (
    <div className={className}>
      {headingEl}
      {subtitleEl}
    </div>
  )
}

export { SectionHeading }
