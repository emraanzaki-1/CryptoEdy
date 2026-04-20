'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Play } from 'lucide-react'

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
      <div className="flex flex-wrap gap-4">
        <Link
          href={href}
          className="from-primary to-primary-container text-on-primary group inline-flex items-center gap-2 rounded-xl bg-gradient-to-b px-8 py-4 font-bold shadow-md transition-all hover:shadow-xl"
        >
          <span>Continue Learning</span>
          <Play className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
        <button
          onClick={() =>
            document.getElementById('curriculum')?.scrollIntoView({ behavior: 'smooth' })
          }
          className="bg-surface-container-lowest text-primary inline-flex items-center rounded-xl px-8 py-4 font-bold shadow-sm transition-all hover:shadow-md"
        >
          View Syllabus
        </button>
      </div>
    )
  }

  if (isProOnly && userRole === 'free') {
    return (
      <button
        onClick={() => router.push('/settings/plans')}
        className="from-primary to-primary/80 inline-flex items-center justify-center rounded-xl bg-gradient-to-r px-8 py-4 font-bold tracking-[0.015em] text-white transition-opacity hover:opacity-90"
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
        className="from-primary to-primary-container text-on-primary inline-flex items-center justify-center rounded-xl bg-gradient-to-b px-8 py-4 font-bold shadow-md transition-all hover:shadow-xl disabled:opacity-50"
      >
        {isLoading ? 'Enrolling...' : 'Enroll Now'}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
