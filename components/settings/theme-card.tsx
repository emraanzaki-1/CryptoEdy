'use client'

import { cn } from '@/lib/utils'

interface ThemeCardProps {
  name: string
  description: string
  value: string
  selected: boolean
  onSelect: (value: string) => void
  preview: React.ReactNode
}

export function ThemeCard({
  name,
  description,
  value,
  selected,
  onSelect,
  preview,
}: ThemeCardProps) {
  return (
    <label
      className={cn(
        'group bg-surface relative flex cursor-pointer flex-col rounded-2xl border p-4 focus:outline-none',
        selected
          ? 'border-primary ring-primary/20 shadow-sm ring-2'
          : 'border-outline-variant/30 hover:bg-surface-container-low transition-colors'
      )}
    >
      <div className="border-outline-variant/30 mb-4 aspect-[4/3] w-full overflow-hidden rounded-lg border">
        {preview}
      </div>
      <span className="flex items-center">
        <span className="flex flex-col">
          <span className="text-on-surface flex w-full items-center justify-between text-sm font-bold">
            {name}
            <span
              className={cn(
                'flex size-5 items-center justify-center rounded-full border-2',
                selected ? 'border-primary' : 'border-outline-variant'
              )}
            >
              {selected && <span className="bg-primary size-2.5 rounded-full" />}
            </span>
          </span>
          <span className="text-on-surface-variant mt-1 text-sm">{description}</span>
        </span>
      </span>
      <input
        type="radio"
        name="theme"
        value={value}
        checked={selected}
        onChange={() => onSelect(value)}
        className="sr-only"
      />
    </label>
  )
}

export function LightThemePreview() {
  return (
    <div className="bg-surface-container-lowest absolute inset-0">
      <div className="border-outline-variant/15 bg-surface-container-low h-4 border-b" />
      <div className="flex h-full">
        <div className="border-outline-variant/15 bg-surface-container-lowest w-1/4 border-r p-2">
          <div className="bg-outline-variant/30 mb-2 h-2 rounded" />
          <div className="bg-outline-variant/30 mb-2 h-2 w-3/4 rounded" />
        </div>
        <div className="flex-1 p-2">
          <div className="bg-primary-fixed/30 mb-2 h-8 rounded" />
          <div className="bg-surface-container-lowest h-20 rounded" />
        </div>
      </div>
    </div>
  )
}

export function DarkThemePreview() {
  return (
    <div className="bg-surface-dim absolute inset-0">
      <div className="border-outline-variant/15 bg-surface-container h-4 border-b" />
      <div className="flex h-full">
        <div className="border-outline-variant/15 bg-surface-container w-1/4 border-r p-2">
          <div className="bg-outline-variant/30 mb-2 h-2 rounded" />
          <div className="bg-outline-variant/30 mb-2 h-2 w-3/4 rounded" />
        </div>
        <div className="flex-1 p-2">
          <div className="bg-primary-container/30 mb-2 h-8 rounded" />
          <div className="bg-surface-container h-20 rounded" />
        </div>
      </div>
    </div>
  )
}

export function SystemThemePreview() {
  return (
    <div className="absolute inset-0 flex">
      <div className="bg-surface-container-lowest relative h-full w-1/2">
        <div className="border-outline-variant/15 bg-surface-container-low h-4 border-b" />
        <div className="border-outline-variant/15 bg-surface-container-lowest absolute top-4 left-0 h-full w-1/2 border-r" />
      </div>
      <div className="bg-surface-dim relative h-full w-1/2">
        <div className="border-outline-variant/15 bg-surface-container h-4 border-b" />
        <div className="border-outline-variant/15 bg-surface-container absolute top-4 right-0 h-full w-full border-l" />
      </div>
    </div>
  )
}
