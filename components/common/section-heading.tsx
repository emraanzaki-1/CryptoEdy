import { cn } from '@/lib/utils'
import { Heading } from '@/components/ui/typography'

/* ── Variant style maps ──────────────────────────────────────── */

const headingVariantProps = {
  page: { size: 'default' as const, responsive: false, className: '' },
  landing: { size: 'md' as const, responsive: true, className: 'font-black' },
  subsection: {
    size: 'default' as const,
    responsive: false,
    className: 'text-body-lg font-semibold',
  },
} as const

const subtitleStyles = {
  page: 'text-on-surface-variant text-body-lg mt-1',
  landing: 'text-on-surface-variant text-body-sm max-w-sm',
} as const

type Variant = keyof typeof headingVariantProps

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
  const tag = as ?? defaultTag[variant]
  const hProps = headingVariantProps[variant]

  /* Subsection — bare heading */
  if (variant === 'subsection') {
    return (
      <Heading as={tag} size={hProps.size} className={cn(hProps.className, 'mb-6', className)}>
        {children}
      </Heading>
    )
  }

  const overlineEl = overline && (
    <span className="text-primary text-overline font-bold uppercase">{overline}</span>
  )
  const headingEl = (
    <Heading
      as={tag}
      size={hProps.size}
      responsive={hProps.responsive}
      className={hProps.className}
    >
      {children}
    </Heading>
  )
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
