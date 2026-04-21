import { cn } from '@/lib/utils'

function SectionTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <h3 className={cn('text-on-surface text-body-lg mb-6 font-semibold', className)}>{children}</h3>
  )
}

export { SectionTitle }
