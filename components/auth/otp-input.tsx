'use client'

import { useRef, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface OTPInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  className?: string
}

export function OTPInput({ length = 6, value, onChange, className }: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [focusedIndex, setFocusedIndex] = useState(-1)

  const digits = value.split('').concat(Array(length - value.length).fill(''))

  const focusInput = useCallback(
    (index: number) => {
      if (index >= 0 && index < length) {
        inputRefs.current[index]?.focus()
      }
    },
    [length]
  )

  function handleChange(index: number, char: string) {
    if (!/^\d*$/.test(char)) return

    const newDigits = [...digits]
    newDigits[index] = char.slice(-1)
    const newValue = newDigits.join('').slice(0, length)
    onChange(newValue)

    if (char && index < length - 1) {
      focusInput(index + 1)
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      focusInput(index - 1)
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      focusInput(index - 1)
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      focusInput(index + 1)
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    onChange(pasted)
    focusInput(Math.min(pasted.length, length - 1))
  }

  return (
    <div className={cn('flex justify-between gap-2 sm:gap-3', className)}>
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputRefs.current[i] = el
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          aria-label={`Digit ${i + 1}`}
          placeholder={focusedIndex === i ? '' : '\u2022'}
          value={digits[i]}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={() => setFocusedIndex(i)}
          onBlur={() => setFocusedIndex(-1)}
          onPaste={handlePaste}
          className="bg-surface-container-high text-on-surface placeholder:text-on-surface-variant/50 focus:bg-surface-container-lowest focus:ring-primary h-14 w-12 rounded-lg border-none text-center text-xl font-bold transition-all duration-200 focus:ring-2 focus:outline-none sm:h-16 sm:w-14"
        />
      ))}
    </div>
  )
}
