'use client'

import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchBarProps {
  className?: string
  placeholder?: string
}

export function SearchBar({ className, placeholder = 'Search (\u2318 /)' }: SearchBarProps) {
  return (
    <label className={cn('flex w-full max-w-md', className)}>
      <div className="bg-surface-container-low focus-within:bg-surface-container-lowest focus-within:ring-primary/20 flex w-full flex-1 items-stretch rounded-full transition-all focus-within:ring-2">
        <div className="text-on-surface-variant flex items-center justify-center pl-4">
          <Search className="size-5" />
        </div>
        <input
          className="text-on-surface placeholder:text-on-surface-variant flex h-10 w-full min-w-0 flex-1 rounded-full border-none bg-transparent px-4 pl-2 text-sm leading-normal font-normal focus:ring-0 focus:outline-none"
          placeholder={placeholder}
          type="text"
        />
      </div>
    </label>
  )
}
