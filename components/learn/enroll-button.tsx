'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ButtonLink } from '@/components/ui/button-link'

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
        <ButtonLink
          href={href}
          variant="gradient"
          size="xl"
          className="group gap-2 shadow-md hover:shadow-xl"
        >
          <span>Continue Learning</span>
          <Play className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </ButtonLink>
        <Button
          variant="tonal"
          size="xl"
          onClick={() =>
            document.getElementById('curriculum')?.scrollIntoView({ behavior: 'smooth' })
          }
          className="shadow-sm hover:translate-y-0 hover:shadow-md"
        >
          View Syllabus
        </Button>
      </div>
    )
  }

  if (isProOnly && userRole === 'free') {
    return (
      <Button onClick={() => router.push('/settings/plans')} variant="gradient" size="xl">
        Upgrade to Enroll
      </Button>
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
      <Button
        onClick={handleEnroll}
        variant="gradient"
        size="xl"
        loading={isLoading}
        className="shadow-md hover:shadow-xl"
      >
        {isLoading ? 'Enrolling...' : 'Enroll Now'}
      </Button>
      {error && <p className="text-error text-body-sm">{error}</p>}
    </div>
  )
}
