'use client'

import { LayoutGrid, List } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ViewToggleProps {
  view: 'grid' | 'list'
  onViewChange: (view: 'grid' | 'list') => void
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="bg-surface-container-low flex items-center gap-2 rounded-lg p-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onViewChange('grid')}
        className={cn(
          'rounded',
          view === 'grid'
            ? 'bg-surface-container-lowest text-primary shadow-sm'
            : 'text-on-surface-variant hover:bg-surface-container-high'
        )}
      >
        <LayoutGrid className="size-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onViewChange('list')}
        className={cn(
          'rounded',
          view === 'list'
            ? 'bg-surface-container-lowest text-primary shadow-sm'
            : 'text-on-surface-variant hover:bg-surface-container-high'
        )}
      >
        <List className="size-5" />
      </Button>
    </div>
  )
}
