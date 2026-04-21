import Link from 'next/link'
import { Search } from 'lucide-react'
import { ButtonLink } from '@/components/ui/button-link'
import { Title } from '@/components/ui/typography'

interface EmptyStateProps {
  title: string
  message: string
  /** Primary CTA label */
  actionLabel?: string
  /** Primary CTA href */
  actionHref?: string
}

export function EmptyState({ title, message, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="flex w-full flex-col items-center py-16">
      <div className="bg-surface-container-low relative flex w-full max-w-xl flex-col items-center overflow-hidden rounded-2xl px-8 pt-8 pb-10">
        {/* Radial gradient background */}
        <div className="from-primary absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_var(--tw-gradient-stops))] via-transparent to-transparent opacity-10" />

        {/* Decorative blurred orbs */}
        <div className="bg-secondary-container/20 absolute top-10 left-10 size-16 rounded-full blur-2xl" />
        <div className="bg-primary-container/20 absolute right-10 bottom-10 size-20 rounded-full blur-2xl" />

        {/* Center icon + skeleton lines */}
        <div className="relative flex flex-col items-center">
          <div className="bg-surface-container-lowest shadow-primary/5 mb-4 flex size-20 items-center justify-center rounded-3xl shadow-xl">
            <Search className="text-primary size-10" strokeWidth={1.2} />
          </div>
          <div className="mb-6 flex gap-2">
            <div className="bg-primary/20 h-1.5 w-12 animate-pulse rounded-full [animation-duration:2s]" />
            <div className="bg-primary/10 h-1.5 w-24 animate-pulse rounded-full [animation-delay:0.3s] [animation-duration:2s]" />
            <div className="bg-primary/5 h-1.5 w-8 animate-pulse rounded-full [animation-delay:0.6s] [animation-duration:2s]" />
          </div>
        </div>

        {/* Text */}
        <div className="relative flex flex-col items-center gap-2 text-center">
          <Title>{title}</Title>
          <p className="text-on-surface-variant text-body-sm max-w-sm">{message}</p>
        </div>

        {/* Primary CTA */}
        {actionLabel && actionHref && (
          <ButtonLink href={actionHref} variant="gradient" size="xl" className="relative mt-6">
            {actionLabel}
          </ButtonLink>
        )}
      </div>
    </div>
  )
}
