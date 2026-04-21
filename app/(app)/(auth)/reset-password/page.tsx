'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/lib/auth/schemas'
import { Button } from '@/components/ui/button'
import { FormField, FormInput } from '@/components/ui/form-field'
import { Heading, Body } from '@/components/ui/typography'

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
          <Heading as="h1">Invalid link</Heading>
          <Body size="lg" className="text-on-surface-variant">
            {tokenError || 'This reset link is invalid or has expired.'}
          </Body>
        </header>

        <div className="bg-error-container text-on-error-container text-body-sm rounded-xl px-5 py-4 font-medium">
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
        <Heading as="h1">Set new password</Heading>
        <Body size="lg" className="text-on-surface-variant">
          Choose a strong password for your account.
        </Body>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {serverError && (
          <div className="bg-error-container text-on-error-container text-body-sm rounded-xl px-5 py-3 font-medium">
            {serverError}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <FormField label="New Password" htmlFor="password" error={errors.password?.message}>
            <FormInput
              id="password"
              type="password"
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              {...register('password')}
            />
          </FormField>

          <FormField
            label="Confirm Password"
            htmlFor="confirmPassword"
            error={errors.confirmPassword?.message}
          >
            <FormInput
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              {...register('confirmPassword')}
            />
          </FormField>
        </div>

        <Button
          type="submit"
          variant="gradient"
          size="xxl"
          loading={isSubmitting}
          className="mt-2 w-full"
        >
          {isSubmitting ? 'Resetting...' : 'Reset password'}
        </Button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-on-surface-variant text-body-sm">
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
