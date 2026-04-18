'use client'

import { Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong')
      return
    }

    router.push('/login?reset=true')
  }

  if (!token) {
    return (
      <div className="flex flex-col gap-10">
        <header className="flex flex-col gap-2">
          <h1 className="font-headline text-on-surface text-[32px] leading-tight font-bold tracking-tight">
            Invalid link
          </h1>
          <p className="text-on-surface-variant text-base leading-relaxed">
            This reset link is invalid or has expired.
          </p>
        </header>

        <div className="bg-error-container text-on-error-container rounded-xl px-5 py-4 text-sm font-medium">
          Invalid reset link.{' '}
          <Link href="/forgot-password" className="font-semibold underline underline-offset-4">
            Request a new one
          </Link>
          .
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <h1 className="font-headline text-on-surface text-[32px] leading-tight font-bold tracking-tight">
          Set new password
        </h1>
        <p className="text-on-surface-variant text-base leading-relaxed">
          Choose a strong password for your account.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {error && (
          <div className="bg-error-container text-on-error-container rounded-xl px-5 py-3 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-on-surface text-xs font-medium tracking-widest uppercase">
              New Password
            </span>
            <input
              type="password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="bg-surface-container-high text-on-surface placeholder:text-on-surface-variant/50 focus:bg-surface-container-lowest focus:ring-primary w-full rounded-xl border-none px-5 py-4 text-base transition-all focus:ring-2 focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-on-surface text-xs font-medium tracking-widest uppercase">
              Confirm Password
            </span>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="bg-surface-container-high text-on-surface placeholder:text-on-surface-variant/50 focus:bg-surface-container-lowest focus:ring-primary w-full rounded-xl border-none px-5 py-4 text-base transition-all focus:ring-2 focus:outline-none"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="from-primary to-primary-container text-on-primary hover:from-primary-container hover:to-primary-container mt-2 w-full rounded-xl bg-gradient-to-b px-6 py-4 text-base font-bold tracking-wide shadow-[0_8px_24px_-8px_rgba(0,62,199,0.4)] transition-all disabled:opacity-50"
        >
          {loading ? 'Resetting...' : 'Reset password'}
        </button>
      </form>

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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="bg-surface-container-low h-64 animate-pulse rounded-xl" />}>
      <ResetPasswordForm />
    </Suspense>
  )
}
