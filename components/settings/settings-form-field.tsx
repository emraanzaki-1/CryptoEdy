import { cn } from '@/lib/utils'

interface SettingsFormFieldProps {
  label: string
  children: React.ReactNode
  className?: string
}

export function SettingsFormField({ label, children, className }: SettingsFormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-on-surface pl-1 text-xs font-bold tracking-wider uppercase">
        {label}
      </label>
      {children}
    </div>
  )
}

export function SettingsInput({
  className,
  readOnly,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'border-outline-variant/30 text-on-surface placeholder:text-outline focus:border-primary focus:ring-primary w-full rounded-2xl border px-5 py-3.5 text-base transition-all focus:ring-2',
        readOnly ? 'bg-surface-container-low' : 'bg-surface',
        className
      )}
      readOnly={readOnly}
      {...props}
    />
  )
}

export function SettingsTextarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'border-outline-variant/30 bg-surface text-on-surface placeholder:text-outline focus:border-primary focus:ring-primary w-full resize-none rounded-2xl border px-5 py-4 text-base leading-relaxed transition-all focus:ring-2',
        className
      )}
      {...props}
    />
  )
}

export function SettingsSelect({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'border-outline-variant/30 bg-surface text-on-surface focus:border-primary focus:ring-primary w-full cursor-pointer appearance-none rounded-2xl border px-5 py-3.5 pr-10 text-base transition-all focus:ring-2',
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
}
