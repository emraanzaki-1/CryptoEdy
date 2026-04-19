'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterFormValues } from '@/lib/auth/schemas'

export default function RegisterPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  })

  async function onSubmit(values: RegisterFormValues) {
    setServerError('')

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: values.email,
        username: values.username,
        password: values.password,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setServerError(data.error ?? 'Registration failed')
      return
    }

    router.push('/login?registered=true')
  }

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <h1 className="font-headline text-on-surface text-headline font-bold">
          Create your account
        </h1>
        <p className="text-on-surface-variant text-base leading-relaxed">
          Join CryptoEdy Research to unlock premium market insights.
        </p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {serverError && (
          <div className="bg-error-container text-on-error-container rounded-xl px-5 py-3 text-sm font-medium">
            {serverError}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label
            className="text-on-surface-variant text-xs font-bold tracking-[0.05em] uppercase"
            htmlFor="email"
          >
            Email Address
          </label>
          <div className="bg-surface-container-high focus-within:bg-surface-container-lowest h-14 w-full overflow-hidden rounded-xl transition-colors duration-200 focus-within:shadow-[0_0_0_2px_rgba(0,62,199,0.15)]">
            <input
              id="email"
              type="email"
              placeholder="name@company.com"
              autoComplete="email"
              {...register('email')}
              className="text-on-surface placeholder:text-on-surface-variant/50 h-full w-full border-none bg-transparent px-4 text-base focus:ring-0 focus:outline-none"
            />
          </div>
          {errors.email && <p className="text-error text-xs font-medium">{errors.email.message}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <label
            className="text-on-surface-variant text-xs font-bold tracking-[0.05em] uppercase"
            htmlFor="username"
          >
            Username
          </label>
          <div className="bg-surface-container-high focus-within:bg-surface-container-lowest h-14 w-full overflow-hidden rounded-xl transition-colors duration-200 focus-within:shadow-[0_0_0_2px_rgba(0,62,199,0.15)]">
            <input
              id="username"
              type="text"
              placeholder="Choose a display name"
              {...register('username')}
              className="text-on-surface placeholder:text-on-surface-variant/50 h-full w-full border-none bg-transparent px-4 text-base focus:ring-0 focus:outline-none"
            />
          </div>
          {errors.username && (
            <p className="text-error text-xs font-medium">{errors.username.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label
            className="text-on-surface-variant text-xs font-bold tracking-[0.05em] uppercase"
            htmlFor="password"
          >
            Password
          </label>
          <div className="bg-surface-container-high focus-within:bg-surface-container-lowest h-14 w-full overflow-hidden rounded-xl transition-colors duration-200 focus-within:shadow-[0_0_0_2px_rgba(0,62,199,0.15)]">
            <input
              id="password"
              type="password"
              placeholder="Minimum 8 characters"
              autoComplete="new-password"
              {...register('password')}
              className="text-on-surface placeholder:text-on-surface-variant/50 h-full w-full border-none bg-transparent px-4 text-base focus:ring-0 focus:outline-none"
            />
          </div>
          {errors.password && (
            <p className="text-error text-xs font-medium">{errors.password.message}</p>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="from-primary to-primary-container text-on-primary flex h-14 w-full items-center justify-center rounded-xl bg-linear-to-b text-base font-bold tracking-[0.015em] shadow-sm transition-opacity hover:opacity-95 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating account...' : 'Sign Up'}
          </button>
        </div>
      </form>

      <div className="mt-2 text-center">
        <p className="text-on-surface-variant text-sm leading-relaxed">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-primary hover:text-primary-container ml-1 font-bold transition-colors"
          >
            Log in instead
          </Link>
        </p>
      </div>
    </div>
  )
}
