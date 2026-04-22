'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import Link from 'next/link'

interface UrgencyBannerProps {
  /** ISO date string of subscription expiry */
  expiresAt: string
}

function getTimeRemaining(expiresAt: string) {
  const diff = new Date(expiresAt).getTime() - Date.now()
  if (diff <= 0) return null

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  return { days, hours, minutes, total: diff }
}

function formatCountdown(t: { days: number; hours: number; minutes: number }): string {
  if (t.days > 0) return `${t.days}d ${t.hours}h remaining`
  if (t.hours > 0) return `${t.hours}h ${t.minutes}m remaining`
  return `${t.minutes}m remaining`
}

export function UrgencyBanner({ expiresAt }: UrgencyBannerProps) {
  const [dismissed, setDismissed] = useState(false)
  const [remaining, setRemaining] = useState(() => getTimeRemaining(expiresAt))

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(getTimeRemaining(expiresAt))
    }, 60_000)
    return () => clearInterval(interval)
  }, [expiresAt])

  if (dismissed || !remaining) return null

  // Only show when 30 days or fewer remain
  if (remaining.days > 30) return null

  const isUrgent = remaining.days <= 7

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-2xl px-5 py-3 ${
        isUrgent ? 'bg-error-container/20 text-error' : 'bg-tertiary-container/20 text-tertiary'
      }`}
    >
      <div className="flex items-center gap-3">
        <AlertTriangle className="size-5 shrink-0" />
        <p className="text-body-sm font-medium">
          Your Pro membership expires in <strong>{formatCountdown(remaining)}</strong>.{' '}
          <Link href="/settings/plans" className="underline underline-offset-2 hover:opacity-80">
            Renew now
          </Link>{' '}
          to keep full access.
        </p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 rounded-full p-1 hover:opacity-70"
        aria-label="Dismiss"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}
