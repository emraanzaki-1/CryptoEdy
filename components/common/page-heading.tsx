import { cn } from '@/lib/utils'

type PageHeadingProps = {
  as?: 'h1' | 'h2'
  variant?: 'default' | 'settings'
  subtitle?: string
  className?: string
  children: React.ReactNode
}

function PageHeading({
  as: Tag = 'h1',
  variant = 'default',
  subtitle,
  className,
  children,
}: PageHeadingProps) {
  return (
    <div>
      <Tag
        className={cn(
          'text-on-surface text-headline font-bold',
          variant === 'settings' && 'font-headline mb-2',
          className
        )}
      >
        {children}
      </Tag>
      {subtitle && <p className="text-on-surface-variant text-body-lg mt-1">{subtitle}</p>}
    </div>
  )
}

export { PageHeading }
