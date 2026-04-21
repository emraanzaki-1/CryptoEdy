'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { X, Sparkles, TrendingUp, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/ui/form-field'
import { Heading } from '@/components/ui/typography'

const DISMISSED_KEY = 'cryptoedy_onboarding_dismissed'
const POPUP_DELAY_MS = 10_000
const SCROLL_THRESHOLD = 0.5 // 50% of page height

export function OnboardingPopup() {
  const { status: sessionStatus } = useSession()
  const [visible, setVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const show = useCallback(() => setVisible(true), [])

  useEffect(() => {
    if (sessionStatus === 'loading') return
    if (sessionStatus === 'authenticated') return

    const dismissed = localStorage.getItem(DISMISSED_KEY)
    if (dismissed) return

    let triggered = false
    const trigger = () => {
      if (triggered) return
      triggered = true
      show()
      cleanup()
    }

    // 1) 10-second timer
    const timer = setTimeout(trigger, POPUP_DELAY_MS)

    // 2) 50% scroll depth
    const handleScroll = () => {
      const scrollY = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      if (docHeight > 0 && scrollY / docHeight >= SCROLL_THRESHOLD) {
        trigger()
      }
    }

    // 3) Exit intent — mouse leaves viewport from the top
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        trigger()
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    document.addEventListener('mouseleave', handleMouseLeave)

    const cleanup = () => {
      clearTimeout(timer)
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }

    return cleanup
  }, [sessionStatus, show])

  function handleDismiss() {
    setVisible(false)
    localStorage.setItem(DISMISSED_KEY, Date.now().toString())
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const trimmed = email.trim()
    if (!trimmed) {
      setError('Please enter your email')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong')
        return
      }

      setSubmitted(true)
      // Auto-dismiss after showing success
      setTimeout(() => {
        setVisible(false)
        localStorage.setItem(DISMISSED_KEY, Date.now().toString())
      }, 3000)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="bg-on-background/40 absolute inset-0 backdrop-blur-md"
        onClick={handleDismiss}
      />

      {/* Modal */}
      <div className="bg-surface-container-lowest ring-on-surface/5 shadow-elevated-emphasis relative flex w-full max-w-4xl flex-col overflow-hidden rounded-lg ring-1 md:flex-row">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDismiss}
          aria-label="Close"
          className="text-on-surface-variant hover:text-on-surface absolute top-6 right-6 z-50"
        >
          <X className="h-6 w-6" />
        </Button>

        {/* Left Column: Branded Visual */}
        <div className="bg-primary-container relative flex w-full flex-col justify-between overflow-hidden p-10 md:w-[45%]">
          {/* Background gradient overlay */}
          <div className="from-primary/40 absolute inset-0 bg-linear-to-br to-transparent" />

          {/* Branding */}
          <div className="relative z-10">
            <div className="mb-4 flex items-center gap-3">
              <div className="bg-surface-container-lowest/20 flex h-10 w-10 items-center justify-center rounded-lg backdrop-blur-md">
                <Sparkles className="text-on-primary h-5 w-5" />
              </div>
              <div className="text-overline text-on-primary font-bolduppercase">
                CryptoEdy Intelligence
              </div>
            </div>
          </div>

          {/* Visual Context/Stats */}
          <div className="relative z-10 mt-auto">
            <div className="space-y-4">
              <div className="border-outline-variant/10 bg-surface-container-lowest/10 rounded-lg border p-4 backdrop-blur-md">
                <div className="text-overline text-on-primary/60 font-bolduppercase mb-1">
                  Network Growth
                </div>
                <div className="flex items-end gap-2">
                  <div className="text-headline text-on-primary font-black">15,000+</div>
                  <div className="text-secondary-fixed-dim text-overline flex items-center pb-1 font-bold">
                    <TrendingUp className="mr-0.5 h-3 w-3" /> 12% MoM
                  </div>
                </div>
              </div>
              <p className="text-on-primary/80 text-body-sm font-medium">
                Join the elite network of institutional researchers decoding the next market cycle.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Form Content */}
        <div className="flex w-full flex-col justify-center p-10 md:w-[55%] md:p-14">
          <div className="space-y-8">
            <div className="space-y-4">
              <Heading size="lg" className="font-black">
                Get the God-Candle Alpha
              </Heading>
              <p className="text-on-surface-variant text-body-lg font-normal">
                Access daily market insights, entry zones, and high-conviction picks delivered
                directly to your inbox.
              </p>
            </div>

            {/* Form */}
            {submitted ? (
              <div className="space-y-3">
                <div className="bg-secondary-fixed/10 text-secondary text-body-sm flex items-center gap-2 rounded-lg p-4 font-medium">
                  <svg
                    className="h-5 w-5 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  You&apos;re in! Check your inbox for your first alpha drop.
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <FormInput
                    type="email"
                    variant="tonal"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (error) setError('')
                    }}
                    className="bg-surface-container-low focus:bg-surface-container-lowest h-14 rounded-lg"
                    placeholder="Enter your work email"
                    autoComplete="email"
                    disabled={submitting}
                  />
                </div>

                {error && <p className="text-error text-body-sm font-medium">{error}</p>}

                <Button
                  type="submit"
                  variant="gradient"
                  size="xxl"
                  loading={submitting}
                  className="text-subtitle w-full rounded-lg"
                >
                  {submitting ? 'Subscribing...' : 'Send Me Insights'}
                </Button>
              </form>
            )}

            {/* Trust Signals */}
            <div className="flex items-center gap-1.5">
              <Lock className="text-outline h-3.5 w-3.5" />
              <span className="text-overline text-outline font-mediumuppercase">
                No spam. Unsubscribe anytime.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
