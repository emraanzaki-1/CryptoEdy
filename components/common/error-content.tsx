import Link from 'next/link'
import { AlertCircle, ArrowLeft, HelpCircle, FileQuestion, ShieldAlert } from 'lucide-react'

interface ErrorContentProps {
  code: number
  title: string
  message: string
  /** Label for the primary CTA */
  backLabel?: string
  /** Href for the primary CTA */
  backHref?: string
  /** Optional retry handler (for error.tsx boundaries) */
  onRetry?: () => void
}

const STATUS_META: Record<number, { icon: typeof AlertCircle; incident: string }> = {
  400: { icon: ShieldAlert, incident: 'BAD-REQUEST' },
  403: { icon: ShieldAlert, incident: 'FORBIDDEN' },
  404: { icon: FileQuestion, incident: 'NOT-FOUND' },
  500: { icon: AlertCircle, incident: 'CRIT-500' },
}

export function ErrorContent({
  code,
  title,
  message,
  backLabel = 'Back to Home',
  backHref = '/',
  onRetry,
}: ErrorContentProps) {
  const meta = STATUS_META[code] ?? STATUS_META[500]
  const Icon = meta.icon

  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden px-8 py-24">
      {/* Decorative blurred orbs */}
      <div className="pointer-events-none absolute inset-0 opacity-10">
        <div className="bg-primary-container absolute -top-[10%] -right-[5%] h-[600px] w-[600px] rounded-full blur-[120px]" />
        <div className="bg-secondary-container absolute -bottom-[10%] -left-[5%] h-[400px] w-[400px] rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-3xl text-center">
        {/* Giant faded code */}
        <h1 className="text-on-surface pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[8rem] leading-none font-black tracking-[-0.04em] opacity-[0.03] select-none md:text-[12rem]">
          {code}
        </h1>

        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <Icon className="text-primary size-14" strokeWidth={1.5} />
        </div>

        {/* Heading */}
        <h2 className="text-on-surface md:text-display mb-6 text-4xl font-black tracking-[-0.04em]">
          {title}
        </h2>

        {/* Message */}
        <div className="mx-auto mb-12 max-w-xl">
          <p className="text-on-surface-variant text-lg leading-relaxed md:text-xl">{message}</p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href={backHref}
            className="from-primary to-primary-container text-on-primary flex items-center gap-2 rounded-xl bg-gradient-to-b px-8 py-4 text-lg font-bold shadow-[0_8px_24px_-8px_rgba(0,62,199,0.4)] transition-transform active:scale-95"
          >
            <ArrowLeft className="size-5" />
            {backLabel}
          </Link>
          {onRetry && (
            <button
              onClick={onRetry}
              className="bg-surface-container-high text-on-surface hover:bg-surface-container-highest flex items-center gap-2 rounded-xl px-8 py-4 text-lg font-bold transition-colors active:scale-95"
            >
              Try Again
            </button>
          )}
          {!onRetry && (
            <Link
              href="/login"
              className="bg-surface-container-high text-on-surface hover:bg-surface-container-highest flex items-center gap-2 rounded-xl px-8 py-4 text-lg font-bold transition-colors active:scale-95"
            >
              <HelpCircle className="size-5" />
              Contact Support
            </Link>
          )}
        </div>

        {/* Status badge */}
        <div className="bg-surface-container-low mt-16 inline-flex items-center gap-3 rounded-full px-4 py-2">
          <span className="relative flex size-3">
            <span className="bg-error absolute inline-flex size-full animate-ping rounded-full opacity-75" />
            <span className="bg-error relative inline-flex size-3 rounded-full" />
          </span>
          <span className="text-on-surface-variant text-sm font-bold tracking-wider uppercase">
            System Incident: {meta.incident}
          </span>
        </div>
      </div>
    </main>
  )
}
