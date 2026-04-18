'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/lib/auth/schemas'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [serverError, setServerError] = useState('')
  const [tokenStatus, setTokenStatus] = useState<'checking' | 'valid' | 'invalid'>(
    token ? 'checking' : 'invalid'
  )
  const [tokenError, setTokenError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  })

  // Pre-validate the token on mount
  useEffect(() => {
    if (!token) return

    fetch(`/api/auth/reset-password?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.valid) {
          setTokenStatus('valid')
        } else {
          setTokenStatus('invalid')
          setTokenError(data.error ?? 'Invalid or expired reset link')
        }
      })
      .catch(() => {
        setTokenStatus('invalid')
        setTokenError('Unable to verify reset link. Please try again.')
      })
  }, [token])

  async function onSubmit(values: ResetPasswordFormValues) {
    setServerError('')

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password: values.password }),
    })

    const data = await res.json()

    if (!res.ok) {
      setServerError(data.error ?? 'Something went wrong')
      return
    }

    router.push('/login?reset=true')
  }

  if (!token || tokenStatus === 'invalid') {
    return (
      <div className="flex flex-col gap-10">
        <header className="flex flex-col gap-2">
          <h1 className="font-headline text-on-surface text-[32px] leading-tight font-bold tracking-tight">
            Invalid link
          </h1>
          <p className="text-on-surface-variant text-base leading-relaxed">
            {tokenError || 'This reset link is invalid or has expired.'}
          </p>
        </header>

        <div className="bg-error-container text-on-error-container rounded-xl px-5 py-4 text-sm font-medium">
          {tokenError || 'Invalid reset link.'}{' '}
          <Link href="/forgot-password" className="font-semibold underline underline-offset-4">
            Request a new one
          </Link>
          .
        </div>
      </div>
    )
  }

  if (tokenStatus === 'checking') {
    return (
      <div className="flex flex-col gap-6">
        <div className="bg-surface-container-low h-8 w-48 animate-pulse rounded-lg" />
        <div className="bg-surface-container-low h-4 w-64 animate-pulse rounded-lg" />
        <div className="bg-surface-container-low h-14 w-full animate-pulse rounded-xl" />
        <div className="bg-surface-container-low h-14 w-full animate-pulse rounded-xl" />
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

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {serverError && (
          <div className="bg-error-container text-on-error-container rounded-xl px-5 py-3 text-sm font-medium">
            {serverError}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-on-surface text-xs font-medium tracking-widest uppercase">
              New Password
            </span>
            <input
              type="password"
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              {...register('password')}
              className="bg-surface-container-high text-on-surface placeholder:text-on-surface-variant/50 focus:bg-surface-container-lowest focus:ring-primary w-full rounded-xl border-none px-5 py-4 text-base transition-all focus:ring-2 focus:outline-none"
            />
            {errors.password && (
              <p className="text-error text-xs font-medium">{errors.password.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-on-surface text-xs font-medium tracking-widest uppercase">
              Confirm Password
            </span>
            <input
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              {...register('confirmPassword')}
              className="bg-surface-container-high text-on-surface placeholder:text-on-surface-variant/50 focus:bg-surface-container-lowest focus:ring-primary w-full rounded-xl border-none px-5 py-4 text-base transition-all focus:ring-2 focus:outline-none"
            />
            {errors.confirmPassword && (
              <p className="text-error text-xs font-medium">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="from-primary to-primary-container text-on-primary hover:from-primary-container hover:to-primary-container shadow-cta mt-2 w-full rounded-xl bg-linear-to-b px-6 py-4 text-base font-bold tracking-wide transition-all disabled:opacity-50"
        >
          {isSubmitting ? 'Resetting...' : 'Reset password'}
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
