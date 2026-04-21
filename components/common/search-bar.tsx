'use client'

import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchBarProps {
  className?: string
  onClick?: () => void
}

export function SearchBar({ className, onClick }: SearchBarProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'bg-surface-container-low hover:bg-surface-container-lowest hover:ring-primary/20 text-body-sm flex h-10 w-full max-w-md cursor-pointer items-center gap-2 rounded-full pr-4 pl-4 transition-all hover:ring-2',
        className
      )}
    >
      <Search className="text-on-surface-variant size-5 shrink-0" />
      <span className="text-on-surface-variant font-normal">Search (⌘ /)</span>
    </button>
  )
}
