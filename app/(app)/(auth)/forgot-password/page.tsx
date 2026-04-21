'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/lib/auth/schemas'
import { Button } from '@/components/ui/button'
import { ButtonLink } from '@/components/ui/button-link'
import { FormField, FormInput } from '@/components/ui/form-field'
import { Heading, Body } from '@/components/ui/typography'

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
        <Heading as="h1">Forgot password</Heading>
        <Body size="lg" className="text-on-surface-variant">
          Enter your email and we&apos;ll send you a reset link if an account exists.
        </Body>
      </header>

      {sent ? (
        <div className="flex flex-col gap-6">
          <div className="bg-secondary-container/20 text-on-surface text-body-sm rounded-xl px-5 py-4 font-medium">
            If an account exists for <strong>{submittedEmail}</strong>, a reset link has been sent.
            Check your inbox.
          </div>

          <ButtonLink href="/login" variant="tonal" size="xxl" className="w-full">
            <ArrowLeft className="size-4" />
            Back to login
          </ButtonLink>
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
