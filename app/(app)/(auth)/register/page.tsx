'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterFormValues } from '@/lib/auth/schemas'
import { Button } from '@/components/ui/button'
import { FormField, FormInput } from '@/components/ui/form-field'
import { Heading, Body } from '@/components/ui/typography'

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
        <Heading as="h1">Create your account</Heading>
        <Body size="lg" className="text-on-surface-variant">
          Join CryptoEdy Research to unlock premium market insights.
        </Body>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {serverError && (
          <div className="bg-error-container text-on-error-container text-body-sm rounded-xl px-5 py-3 font-medium">
            {serverError}
          </div>
        )}

        <FormField label="Email Address" htmlFor="email" error={errors.email?.message}>
          <FormInput
            id="email"
            type="email"
            placeholder="name@company.com"
            autoComplete="email"
            {...register('email')}
          />
        </FormField>

        <FormField label="Username" htmlFor="username" error={errors.username?.message}>
          <FormInput
            id="username"
            type="text"
            placeholder="Choose a display name"
            {...register('username')}
          />
        </FormField>

        <FormField label="Password" htmlFor="password" error={errors.password?.message}>
          <FormInput
            id="password"
            type="password"
            placeholder="Minimum 8 characters"
            autoComplete="new-password"
            {...register('password')}
          />
        </FormField>

        <div className="mt-6 flex flex-col gap-4">
          <Button
            type="submit"
            variant="gradient"
            size="xxl"
            loading={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Creating account...' : 'Sign Up'}
          </Button>
        </div>
      </form>

      <div className="mt-2 text-center">
        <p className="text-on-surface-variant text-body-sm">
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
