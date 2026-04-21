'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/lib/auth/schemas'
import { Button } from '@/components/ui/button'
import { FormField, FormInput } from '@/components/ui/form-field'

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  async function onSubmit(values: ForgotPasswordFormValues) {
    await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: values.email }),
    })

    setSubmittedEmail(values.email)
    setSent(true)
  }

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <h1 className="font-headline text-on-surface text-headline font-bold">Forgot password</h1>
        <p className="text-on-surface-variant text-base leading-relaxed">
          Enter your email and we&apos;ll send you a reset link if an account exists.
        </p>
      </header>

      {sent ? (
        <div className="flex flex-col gap-6">
          <div className="bg-secondary-container/20 text-on-surface rounded-xl px-5 py-4 text-sm leading-relaxed font-medium">
            If an account exists for <strong>{submittedEmail}</strong>, a reset link has been sent.
            Check your inbox.
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
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <FormField label="Email Address" htmlFor="email" error={errors.email?.message}>
            <FormInput
              id="email"
              type="email"
              placeholder="researcher@cryptoedy.com"
              autoComplete="email"
              {...register('email')}
            />
          </FormField>

          <Button
            type="submit"
            variant="gradient"
            size="xxl"
            loading={isSubmitting}
            className="mt-2 w-full"
          >
            {isSubmitting ? 'Sending...' : 'Send reset link'}
          </Button>
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
