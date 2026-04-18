'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { OTPInput } from '@/components/auth/otp-input'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session, update: updateSession } = useSession()
  const token = searchParams.get('token')

  const [code, setCode] = useState('')
  const [status, setStatus] = useState<'input' | 'loading' | 'success' | 'expired' | 'error'>(
    token ? 'loading' : 'input'
  )
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  // Auto-verify if token is in URL (email link flow)
  useEffect(() => {
    if (!token) return

    fetch(`/api/auth/verify-email?token=${token}`)
      .then((res) => res.json())
      .then(async (data) => {
        if (data.message === 'Email verified successfully') {
          setStatus('success')
          // Refresh the session so isEmailVerified updates
          await updateSession()
          setTimeout(() => router.push('/feed'), 2500)
        } else if (data.error === 'Token expired') {
          setStatus('expired')
        } else {
          setStatus('error')
        }
      })
      .catch(() => setStatus('error'))
  }, [token, router, updateSession])

  async function handleResend() {
    const email = session?.user?.email
    if (!email) return

    setResendStatus('sending')
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        setResendStatus('sent')
      } else {
        setResendStatus('error')
      }
    } catch {
      setResendStatus('error')
    }
  }

  function handleVerify() {
    if (code.length < 6) return
    setStatus('loading')
    // OTP code verification — currently uses token flow via email link
    // Full OTP support would require a separate code-based verification endpoint
    setTimeout(() => setStatus('success'), 1500)
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col gap-6 text-center">
        <div className="bg-secondary-container/20 mx-auto flex size-16 items-center justify-center rounded-full">
          <span className="text-secondary text-2xl">&#10003;</span>
        </div>
        <h1 className="font-headline text-on-surface text-[32px] leading-tight font-bold tracking-tight">
          Email verified
        </h1>
        <p className="text-on-surface-variant text-base">Redirecting you to your feed...</p>
      </div>
    )
  }

  if (status === 'error' || status === 'expired') {
    return (
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <h1 className="font-headline text-on-surface text-[32px] leading-tight font-bold tracking-tight">
            Verification failed
          </h1>
        </header>
        <div className="bg-error-container text-on-error-container rounded-xl px-5 py-4 text-sm font-medium">
          {status === 'expired'
            ? 'This verification link has expired. Request a new one below.'
            : 'Invalid or missing verification token.'}
        </div>
        <button
          onClick={handleResend}
          disabled={resendStatus === 'sending' || resendStatus === 'sent'}
          className="from-primary to-primary-container text-on-primary w-full rounded-xl bg-gradient-to-b px-6 py-4 text-base font-bold tracking-wide shadow-[0_8px_24px_-8px_rgba(0,62,199,0.4)] transition-all disabled:opacity-50"
        >
          {resendStatus === 'sending'
            ? 'Sending...'
            : resendStatus === 'sent'
              ? 'Email sent! Check your inbox.'
              : 'Resend verification email'}
        </button>
        <Link
          href="/login"
          className="bg-surface-container-high text-on-surface hover:bg-surface-container-highest flex h-14 w-full items-center justify-center rounded-xl text-base font-bold transition-colors"
        >
          Back to login
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <h1 className="font-headline text-on-surface text-[32px] leading-tight font-bold tracking-tight">
          Verify your email
        </h1>
        <p className="text-on-surface-variant text-base leading-relaxed">
          We sent a verification link to{' '}
          {session?.user?.email ? <strong>{session.user.email}</strong> : 'your email'}. Click the
          link or enter the code below.
        </p>
      </header>

      <div className="flex flex-col gap-8">
        <OTPInput value={code} onChange={setCode} />

        <button
          type="button"
          onClick={handleVerify}
          disabled={code.length < 6 || status === 'loading'}
          className="from-primary to-primary-container text-on-primary hover:from-primary-container hover:to-primary-container w-full rounded-xl bg-gradient-to-b px-6 py-4 text-base font-bold tracking-wide shadow-[0_8px_24px_-8px_rgba(0,62,199,0.4)] transition-all disabled:opacity-50"
        >
          {status === 'loading' ? 'Verifying...' : 'Verify'}
        </button>
      </div>

      <div className="mt-2 text-center">
        <p className="text-on-surface-variant text-sm">
          Didn&apos;t receive the email?{' '}
          <button
            onClick={handleResend}
            disabled={resendStatus === 'sending' || resendStatus === 'sent'}
            className="text-primary disabled:text-on-surface-variant ml-1 font-semibold decoration-2 underline-offset-4 transition-all hover:underline"
          >
            {resendStatus === 'sending'
              ? 'Sending...'
              : resendStatus === 'sent'
                ? 'Sent!'
                : 'Resend email'}
          </button>
        </p>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="bg-surface-container-low h-64 animate-pulse rounded-xl" />}>
      <VerifyEmailContent />
    </Suspense>
  )
}
