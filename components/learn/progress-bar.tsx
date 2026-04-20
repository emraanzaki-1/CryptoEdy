'use client'

import { cn } from '@/lib/utils'

interface ProgressBarProps {
  completedCount: number
  totalCount: number
  className?: string
}

export function ProgressBar({ completedCount, totalCount, className }: ProgressBarProps) {
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="bg-surface-container h-2 flex-1 overflow-hidden rounded-full">
        <div
          className="bg-primary h-full rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-on-surface-variant text-xs font-medium">
        {completedCount}/{totalCount} lessons
      </span>
    </div>
  )
}
