'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface EnrollButtonProps {
  courseId: number
  isEnrolled: boolean
  courseSlug: string
  isProOnly?: boolean
  userRole?: string
  firstIncompleteLessonSlug?: string
}

export function EnrollButton({
  courseId,
  isEnrolled: initialEnrolled,
  courseSlug,
  isProOnly,
  userRole,
  firstIncompleteLessonSlug,
}: EnrollButtonProps) {
  const [isEnrolled, setIsEnrolled] = useState(initialEnrolled)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  if (isEnrolled) {
    const href = firstIncompleteLessonSlug
      ? `/learn/courses/${courseSlug}/${firstIncompleteLessonSlug}`
      : `/learn/courses/${courseSlug}`

    return (
      <button
        onClick={() => router.push(href)}
        className="bg-primary hover:bg-primary/90 inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold tracking-[0.015em] text-white transition-colors"
      >
        Continue Learning
      </button>
    )
  }

  if (isProOnly && userRole === 'free') {
    return (
      <button
        onClick={() => router.push('/settings/plans')}
        className="from-primary to-primary/80 inline-flex items-center justify-center rounded-xl bg-gradient-to-r px-6 py-3 text-sm font-semibold tracking-[0.015em] text-white transition-opacity hover:opacity-90"
      >
        Upgrade to Enroll
      </button>
    )
  }

  async function handleEnroll() {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/courses/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      })
      if (res.ok) {
        setIsEnrolled(true)
      } else {
        const data = await res.json().catch(() => null)
        setError(data?.error ?? 'Failed to enroll. Please try again.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleEnroll}
        disabled={isLoading}
        className="bg-primary hover:bg-primary/90 inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold tracking-[0.015em] text-white transition-colors disabled:opacity-50"
      >
        {isLoading ? 'Enrolling...' : 'Enroll Now'}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
