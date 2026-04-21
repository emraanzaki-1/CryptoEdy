import { cn } from '@/lib/utils'

type SectionHeadingProps = {
  overline?: string
  title: React.ReactNode
  subtitle?: string
  align?: 'left' | 'split'
  className?: string
  children?: React.ReactNode
}

function SectionHeading({
  overline,
  title,
  subtitle,
  align = 'left',
  className,
  children,
}: SectionHeadingProps) {
  if (align === 'split') {
    return (
      <div
        className={cn('flex flex-col gap-6 md:flex-row md:items-end md:justify-between', className)}
      >
        <div className="flex flex-col gap-3">
          {overline && (
            <span className="text-primary text-overline font-bold uppercase">{overline}</span>
          )}
          <h2 className="font-headline text-on-surface text-headline md:text-headline-md font-black">
            {title}
          </h2>
        </div>
        <div className="flex items-end gap-4">
          {subtitle && <p className="text-on-surface-variant text-body-sm max-w-sm">{subtitle}</p>}
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {overline && (
        <span className="text-primary text-overline font-bold uppercase">{overline}</span>
      )}
      <h2 className="font-headline text-on-surface text-headline md:text-headline-md font-black">
        {title}
      </h2>
      {subtitle && <p className="text-on-surface-variant text-body-sm max-w-sm">{subtitle}</p>}
      {children}
    </div>
  )
}

export { SectionHeading }
