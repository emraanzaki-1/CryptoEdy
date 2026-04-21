import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  title: string
  subtitle: string
  /** Slot rendered to the right of the title block (e.g. ViewToggle) */
  action?: React.ReactNode
  className?: string
}

export function SectionHeader({ title, subtitle, action, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex flex-col justify-between gap-4 sm:flex-row sm:items-end', className)}>
      <div>
        <h1 className="text-on-surface text-headline font-bold">{title}</h1>
        <p className="text-on-surface-variant text-body-lg mt-2">{subtitle}</p>
      </div>
      {action}
    </div>
  )
}
