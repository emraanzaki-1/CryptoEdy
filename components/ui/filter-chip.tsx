'use client'

import { cn } from '@/lib/utils'

interface FilterChipProps {
  label: string
  active?: boolean
  onClick?: () => void
}

export function FilterChip({ label, active = false, onClick }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'h-9 rounded-full px-4 text-sm font-medium transition-colors',
        active
          ? 'bg-primary text-on-primary hover:bg-primary-container shadow-sm'
          : 'bg-surface-container-low text-on-surface hover:bg-surface-container-high'
      )}
    >
      {label}
    </button>
  )
}
