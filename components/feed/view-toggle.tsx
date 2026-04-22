'use client'

import { LayoutGrid, List } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ViewToggleProps {
  view: 'grid' | 'list'
  onViewChange: (view: 'grid' | 'list') => void
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="bg-surface-container-low relative flex items-center gap-0.5 rounded-lg p-1">
      {/* Sliding indicator */}
      <span
        className={cn(
          'bg-surface-container-lowest absolute left-1 size-9 rounded-md shadow-sm',
          'transition-transform duration-250 ease-[cubic-bezier(0.4,0,0.2,1)]',
          view === 'list' ? 'translate-x-[calc(100%+2px)]' : 'translate-x-0'
        )}
      />
      <button
        type="button"
        onClick={() => onViewChange('grid')}
        aria-label="Grid view"
        className={cn(
          'focus-visible:ring-primary relative z-10 flex size-9 cursor-pointer items-center justify-center rounded-md transition-colors duration-200 focus-visible:ring-2 focus-visible:outline-none',
          view === 'grid' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
        )}
      >
        <LayoutGrid className="size-5" />
      </button>
      <button
        type="button"
        onClick={() => onViewChange('list')}
        aria-label="List view"
        className={cn(
          'focus-visible:ring-primary relative z-10 flex size-9 cursor-pointer items-center justify-center rounded-md transition-colors duration-200 focus-visible:ring-2 focus-visible:outline-none',
          view === 'list' ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
        )}
      >
        <List className="size-5" />
      </button>
    </div>
  )
}
