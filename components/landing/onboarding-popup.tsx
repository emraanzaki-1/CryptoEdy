'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { X, Sparkles, TrendingUp, Lock } from 'lucide-react'

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
      <div className="bg-surface-container-lowest ring-on-surface/5 relative flex w-full max-w-4xl flex-col overflow-hidden rounded-lg shadow-[0_32px_64px_-12px_rgba(11,28,48,0.15)] ring-1 md:flex-row">
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          aria-label="Close"
          className="text-on-surface-variant hover:text-on-surface absolute top-6 right-6 z-50 cursor-pointer p-1 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Left Column: Branded Visual */}
        <div className="bg-primary-container relative flex w-full flex-col justify-between overflow-hidden p-10 md:w-[45%]">
          {/* Background gradient overlay */}
          <div className="from-primary/40 absolute inset-0 bg-linear-to-br to-transparent" />

          {/* Branding */}
          <div className="relative z-10">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-md">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div className="text-overline font-bold tracking-[0.15em] text-white uppercase">
                CryptoEdy Intelligence
              </div>
            </div>
          </div>

          {/* Visual Context/Stats */}
          <div className="relative z-10 mt-auto">
            <div className="space-y-4">
              <div className="rounded-lg border border-white/10 bg-white/10 p-4 backdrop-blur-md">
                <div className="text-overline mb-1 font-bold tracking-[0.05em] text-white/60 uppercase">
                  Network Growth
                </div>
                <div className="flex items-end gap-2">
                  <div className="text-2xl font-black text-white">15,000+</div>
                  <div className="text-secondary-fixed-dim text-overline flex items-center pb-1 font-bold">
                    <TrendingUp className="mr-0.5 h-3 w-3" /> 12% MoM
                  </div>
                </div>
              </div>
              <p className="text-sm font-medium text-white/80">
                Join the elite network of institutional researchers decoding the next market cycle.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Form Content */}
        <div className="flex w-full flex-col justify-center p-10 md:w-[55%] md:p-14">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-on-background text-headline-lg leading-[1.05] font-black tracking-[-0.04em]">
                Get the God-Candle Alpha
              </h2>
              <p className="text-on-surface-variant text-base leading-relaxed font-normal">
                Access daily market insights, entry zones, and high-conviction picks delivered
                directly to your inbox.
              </p>
            </div>

            {/* Form */}
            {submitted ? (
              <div className="space-y-3">
                <div className="bg-secondary-fixed/10 text-secondary flex items-center gap-2 rounded-lg p-4 text-sm font-medium">
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
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (error) setError('')
                    }}
                    className="bg-surface-container-low text-on-background placeholder:text-outline focus:ring-primary focus:bg-surface-container-lowest h-14 w-full rounded-lg border-none px-5 transition-all duration-300 outline-none focus:ring-2"
                    placeholder="Enter your work email"
                    autoComplete="email"
                    disabled={submitting}
                  />
                </div>

                {error && <p className="text-error text-sm font-medium">{error}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="from-primary to-primary-container text-on-primary shadow-primary/20 hover:shadow-primary/30 h-14 w-full cursor-pointer rounded-lg bg-linear-to-b text-lg font-bold shadow-lg transition-all duration-200 hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? 'Subscribing...' : 'Send Me Insights'}
                </button>
              </form>
            )}

            {/* Trust Signals */}
            <div className="flex items-center gap-1.5">
              <Lock className="text-outline h-3.5 w-3.5" />
              <span className="text-overline text-outline font-medium tracking-[0.05em] uppercase">
                No spam. Unsubscribe anytime.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
