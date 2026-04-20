'use client'

import { cn } from '@/lib/utils'

interface ToggleSwitchProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
  className?: string
  disabled?: boolean
}

export function ToggleSwitch({
  checked = false,
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
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <div className="peer bg-outline-variant/50 peer-checked:bg-primary h-6 w-12 rounded-full after:absolute after:top-[2px] after:left-[2px] after:size-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white" />
    </label>
  )
}
