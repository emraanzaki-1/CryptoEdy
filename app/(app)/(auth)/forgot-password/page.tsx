'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    setLoading(false)
    setSent(true)
  }

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <h1 className="font-headline text-on-surface text-[32px] leading-tight font-bold tracking-tight">
          Forgot password
        </h1>
        <p className="text-on-surface-variant text-base leading-relaxed">
          Enter your email and we&apos;ll send you a reset link if an account exists.
        </p>
      </header>

      {sent ? (
        <div className="flex flex-col gap-6">
          <div className="bg-secondary-container/20 text-on-surface rounded-xl px-5 py-4 text-sm leading-relaxed font-medium">
            If an account exists for <strong>{email}</strong>, a reset link has been sent. Check
            your inbox.
          </div>

          <Link
            href="/login"
            className="bg-surface-container-high text-on-surface hover:bg-surface-container-highest flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-base font-bold transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <label className="flex flex-col gap-2">
            <span className="text-on-surface text-xs font-medium tracking-widest uppercase">
              Email Address
            </span>
            <input
              type="email"
              placeholder="researcher@cryptoedy.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="bg-surface-container-high text-on-surface placeholder:text-on-surface-variant/50 focus:bg-surface-container-lowest focus:ring-primary w-full rounded-xl border-none px-5 py-4 text-base transition-all focus:ring-2 focus:outline-none"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="from-primary to-primary-container text-on-primary hover:from-primary-container hover:to-primary-container mt-2 w-full rounded-xl bg-gradient-to-b px-6 py-4 text-base font-bold tracking-wide shadow-[0_8px_24px_-8px_rgba(0,62,199,0.4)] transition-all disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>
      )}

      <div className="mt-4 text-center">
        <p className="text-on-surface-variant text-sm">
          Remember your password?{' '}
          <Link
            href="/login"
            className="text-primary font-semibold decoration-2 underline-offset-4 hover:underline"
          >
            Back to login
          </Link>
        </p>
      </div>
    </div>
  )
}
