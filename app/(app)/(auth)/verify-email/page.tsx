'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session, status: sessionStatus, update: updateSession } = useSession()
  const token = searchParams.get('token')
  const verifyAttempted = useRef(false)

  const [status, setStatus] = useState<'waiting' | 'loading' | 'success' | 'expired' | 'error'>(
    token ? 'loading' : 'waiting'
  )
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  // Auto-verify when token is in URL (email link flow).
  // We wait for sessionStatus to leave 'loading' so we know whether the
  // user is logged in, avoiding a stale-closure null for `session`.
  useEffect(() => {
    if (!token || verifyAttempted.current) return
    if (sessionStatus === 'loading') return // wait until session resolves

    verifyAttempted.current = true

    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then(async (data) => {
        if (data.message === 'Email verified successfully') {
          setStatus('success')

          if (sessionStatus === 'authenticated') {
            // User is logged in — refresh their JWT so proxy sees isEmailVerified: true
            await updateSession()
            router.push('/feed')
          } else {
            // User is not logged in — send to login with success banner
            router.push('/login?verified=true')
          }
        } else if (data.error === 'Token expired') {
          setStatus('expired')
        } else {
          setStatus('error')
        }
      })
      .catch(() => setStatus('error'))
  }, [token, sessionStatus]) // eslint-disable-line react-hooks/exhaustive-deps

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

  if (status === 'success') {
    return (
      <div className="flex flex-col gap-6 text-center">
        <div className="bg-secondary-container/20 mx-auto flex size-16 items-center justify-center rounded-full">
          <span className="text-secondary text-headline">&#10003;</span>
        </div>
        <h1 className="font-headline text-on-surface text-headline font-bold">Email verified</h1>
        <p className="text-on-surface-variant text-base">Redirecting&hellip;</p>
      </div>
    )
  }

  if (status === 'error' || status === 'expired') {
    return (
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <h1 className="font-headline text-on-surface text-headline font-bold">
            Verification failed
          </h1>
        </header>
        <div className="bg-error-container text-on-error-container rounded-xl px-5 py-4 text-sm font-medium">
          {status === 'expired'
            ? 'This verification link has expired. Request a new one below.'
            : 'Invalid or missing verification token.'}
        </div>
        <Button
          variant="gradient"
          size="xxl"
          onClick={handleResend}
          loading={resendStatus === 'sending'}
          disabled={resendStatus === 'sent'}
          className="w-full"
        >
          {resendStatus === 'sending'
            ? 'Sending...'
            : resendStatus === 'sent'
              ? 'Email sent! Check your inbox.'
              : 'Resend verification email'}
        </Button>
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
        <h1 className="font-headline text-on-surface text-headline font-bold">Verify your email</h1>
        <p className="text-on-surface-variant text-base leading-relaxed">
          We sent a verification link to{' '}
          {session?.user?.email ? <strong>{session.user.email}</strong> : 'your email'}. Click the
          link in the email to verify your account.
        </p>
      </header>

      <div className="flex flex-col gap-4">
        <Button
          variant="gradient"
          size="xxl"
          onClick={handleResend}
          loading={resendStatus === 'sending'}
          disabled={resendStatus === 'sent'}
          className="w-full"
        >
          {resendStatus === 'sending'
            ? 'Sending...'
            : resendStatus === 'sent'
              ? 'Email sent! Check your inbox.'
              : 'Resend verification email'}
        </Button>
      </div>

      <div className="mt-2 text-center">
        <p className="text-on-surface-variant text-sm">
          Wrong email?{' '}
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

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="bg-surface-container-low h-64 animate-pulse rounded-xl" />}>
      <VerifyEmailContent />
    </Suspense>
  )
}
