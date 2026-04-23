'use client'

import { cn } from '@/lib/utils'

interface ProgressBarProps {
  completedCount: number
  totalCount: number
  className?: string
  variant?: 'primary' | 'secondary'
  showPercent?: boolean
}

export function ProgressBar({
  completedCount,
  totalCount,
  className,
  variant = 'primary',
  showPercent = false,
}: ProgressBarProps) {
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="bg-surface-container h-2 flex-1 overflow-hidden rounded-full">
        <div
          className={cn(
            'h-full w-full origin-left rounded-full transition-transform duration-500',
            variant === 'secondary' ? 'bg-secondary' : 'bg-primary'
          )}
          style={{ transform: `scaleX(${percent / 100})` }}
        />
      </div>
      <span className="text-on-surface-variant text-micro font-medium">
        {showPercent ? `${percent}%` : `${completedCount}/${totalCount} lessons`}
      </span>
    </div>
  )
}
