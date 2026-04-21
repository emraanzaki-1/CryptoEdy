'use client'

import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface MarkCompleteButtonProps {
  lessonId: number
  courseId: number
  isCompleted: boolean
  nextLessonSlug?: string
  courseSlug: string
}

export function MarkCompleteButton({
  lessonId,
  courseId,
  isCompleted: initialCompleted,
  nextLessonSlug,
  courseSlug,
}: MarkCompleteButtonProps) {
  const [isCompleted, setIsCompleted] = useState(initialCompleted)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleComplete() {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/courses/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, courseId }),
      })
      if (res.ok) {
        setIsCompleted(true)
        if (nextLessonSlug) {
          setTimeout(() => {
            router.push(`/learn/courses/${courseSlug}/${nextLessonSlug}`)
            router.refresh()
          }, 500)
        } else {
          router.refresh()
        }
      } else {
        const data = await res.json().catch(() => null)
        setError(data?.error ?? 'Failed to mark as complete.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isCompleted) {
    return (
      <div className="bg-secondary/10 text-secondary flex w-full items-center justify-center gap-2 rounded-xl py-6 text-lg font-bold">
        <CheckCircle2 className="h-5 w-5" />
        Completed
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleComplete}
        variant="gradient"
        size="xxl"
        loading={isLoading}
        className="w-full text-lg"
      >
        {isLoading ? 'Saving...' : 'Mark as Complete'}
      </Button>
      {error && <p className="text-error text-center text-sm">{error}</p>}
    </div>
  )
}
