'use client'

import { cn } from '@/lib/utils'
import { Minus } from 'lucide-react'

interface ToggleSwitchProps {
  checked?: boolean
  /** Shows a dash indicator when subtypes are in a mixed state. */
  indeterminate?: boolean
  onChange?: (checked: boolean) => void
  className?: string
  disabled?: boolean
}

export function ToggleSwitch({
  checked = false,
  indeterminate = false,
  onChange,
  className,
  disabled,
}: ToggleSwitchProps) {
  return (
    <label
      className={cn(
        'relative inline-flex cursor-pointer items-center',
        disabled && 'pointer-events-none opacity-50',
        className
      )}
    >
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked || indeterminate}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <div
        className={cn(
          'peer h-6 w-12 rounded-full after:absolute after:top-[2px] after:left-[2px] after:size-5 after:rounded-full after:border after:transition-all',
          indeterminate
            ? 'bg-outline-variant after:border-on-surface-variant after:bg-surface-container-lowest after:translate-x-full'
            : 'bg-outline-variant/50 peer-checked:bg-primary after:border-outline-variant/30 after:bg-surface-container-lowest peer-checked:after:border-on-primary peer-checked:after:translate-x-full'
        )}
      />
      {indeterminate && (
        <Minus className="text-on-surface-variant pointer-events-none absolute right-1 size-3" />
      )}
    </label>
  )
}
