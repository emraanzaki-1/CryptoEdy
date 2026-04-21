import * as React from 'react'
import { cn } from '@/lib/utils'

/* ── FormField (label + error wrapper) ─────────────────────────── */

type FormFieldProps = {
  label: string
  htmlFor: string
  error?: string
  className?: string
  /** Slot between label and children — e.g. a "Forgot password?" link */
  labelAction?: React.ReactNode
  children: React.ReactNode
}

function FormField({ label, htmlFor, error, className, labelAction, children }: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center justify-between">
        <label
          htmlFor={htmlFor}
          className="text-on-surface-variant text-overline font-bold uppercase"
        >
          {label}
        </label>
        {labelAction}
      </div>
      {children}
      {error && <p className="text-error text-micro font-medium">{error}</p>}
    </div>
  )
}

/* ── Shared input styles ───────────────────────────────────────── */

const inputBase = 'w-full text-on-surface text-body-lg transition-all outline-none'

const inputVariants = {
  tonal:
    'bg-surface-container-high placeholder:text-on-surface-variant/50 focus:bg-surface-container-lowest rounded-xl border-none px-4 py-4 focus:ring-2 focus:ring-primary focus:outline-none',
  outlined:
    'bg-surface placeholder:text-outline border border-outline-variant/30 rounded-2xl px-4 py-3.5 focus:border-primary focus:ring-2 focus:ring-primary',
  ghost:
    'bg-transparent placeholder:text-on-surface-variant/50 border-none px-0 py-0 font-medium focus:ring-0 focus:outline-none',
  danger:
    'bg-transparent placeholder:text-outline border border-error/30 rounded-2xl px-4 py-3.5 focus:border-error focus:ring-2 focus:ring-error',
} as const

type Variant = keyof typeof inputVariants

/* ── FormInput ─────────────────────────────────────────────────── */

type FormInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  variant?: Variant
}

const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, variant = 'tonal', readOnly, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        inputBase,
        inputVariants[variant],
        readOnly && 'bg-surface-container-low',
        className
      )}
      readOnly={readOnly}
      {...props}
    />
  )
)
FormInput.displayName = 'FormInput'

/* ── FormTextarea ──────────────────────────────────────────────── */

type FormTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  variant?: Variant
}

const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ className, variant = 'tonal', ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(inputBase, inputVariants[variant], 'resize-none leading-relaxed', className)}
      {...props}
    />
  )
)
FormTextarea.displayName = 'FormTextarea'

/* ── FormSelect ────────────────────────────────────────────────── */

type FormSelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  variant?: Variant
}

const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ className, variant = 'tonal', children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        inputBase,
        inputVariants[variant],
        'cursor-pointer appearance-none pr-10',
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
)
FormSelect.displayName = 'FormSelect'

export { FormField, FormInput, FormTextarea, FormSelect }
