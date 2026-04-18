'use client'

import { LayoutGrid, List } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ViewToggleProps {
  view: 'grid' | 'list'
  onViewChange: (view: 'grid' | 'list') => void
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="bg-surface-container-low flex items-center gap-2 rounded-lg p-1">
      <button
        onClick={() => onViewChange('grid')}
        className={cn(
          'flex items-center justify-center rounded p-2 transition-colors',
          view === 'grid'
            ? 'bg-surface-container-lowest text-primary shadow-sm'
            : 'text-on-surface-variant hover:bg-surface-container-high'
        )}
      >
        <LayoutGrid className="size-5" />
      </button>
      <button
        onClick={() => onViewChange('list')}
        className={cn(
          'flex items-center justify-center rounded p-2 transition-colors',
          view === 'list'
            ? 'bg-surface-container-lowest text-primary shadow-sm'
            : 'text-on-surface-variant hover:bg-surface-container-high'
        )}
      >
        <List className="size-5" />
      </button>
    </div>
  )
}
