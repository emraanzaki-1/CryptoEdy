'use client'

import { Suspense, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormValues } from '@/lib/auth/schemas'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/feed'
  const registered = searchParams.get('registered') === 'true'
  const reset = searchParams.get('reset') === 'true'

  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(values: LoginFormValues) {
    setServerError('')

    const result = await signIn('credentials', {
      email: values.email,
      password: values.password,
      redirect: false,
    })

    if (result?.error) {
      setServerError('Invalid email or password')
      return
    }

    router.push(callbackUrl)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <h1 className="font-headline text-on-surface text-[32px] leading-tight font-bold tracking-[-0.04em]">
          Welcome back
        </h1>
        <p className="text-on-surface-variant text-base leading-relaxed">
          Use your email address to enter the research gallery.
        </p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {registered && (
          <div className="bg-secondary-container/20 text-on-surface rounded-xl px-5 py-3 text-sm font-medium">
            Account created! Check your email to verify, then log in.
          </div>
        )}

        {reset && (
          <div className="bg-secondary-container/20 text-on-surface rounded-xl px-5 py-3 text-sm font-medium">
            Password reset successfully. You can now log in with your new password.
          </div>
        )}

        {serverError && (
          <div className="bg-error-container text-on-error-container rounded-xl px-5 py-3 text-sm font-medium">
            {serverError}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-on-surface text-xs font-medium tracking-widest uppercase">
              Email Address
            </span>
            <input
              type="email"
              placeholder="researcher@cryptoedy.com"
              autoComplete="email"
              {...register('email')}
              className="bg-surface-container-high text-on-surface placeholder:text-on-surface-variant/50 focus:bg-surface-container-lowest focus:ring-primary w-full rounded-xl border-none px-5 py-4 text-base transition-all focus:ring-2 focus:outline-none"
            />
            {errors.email && (
              <p className="text-error text-xs font-medium">{errors.email.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-on-surface text-xs font-medium tracking-widest uppercase">
                Password
              </span>
              <Link
                href="/forgot-password"
                className="text-primary text-xs font-semibold hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              {...register('password')}
              className="bg-surface-container-high text-on-surface placeholder:text-on-surface-variant/50 focus:bg-surface-container-lowest focus:ring-primary w-full rounded-xl border-none px-5 py-4 text-base transition-all focus:ring-2 focus:outline-none"
            />
            {errors.password && (
              <p className="text-error text-xs font-medium">{errors.password.message}</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="from-primary to-primary-container text-on-primary hover:from-primary-container hover:to-primary-container shadow-cta mt-2 w-full rounded-xl bg-linear-to-b px-6 py-4 text-base font-bold tracking-wide transition-all disabled:opacity-50"
        >
          {isSubmitting ? 'Signing in...' : 'Access Gallery'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-on-surface-variant text-sm">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="text-primary font-semibold decoration-2 underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="bg-surface-container-low h-64 animate-pulse rounded-xl" />}>
      <LoginForm />
    </Suspense>
  )
}
