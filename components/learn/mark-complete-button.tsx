'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
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
  const router = useRouter()

  async function handleComplete() {
    setIsLoading(true)
    try {
      const res = await fetch('/api/courses/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, courseId }),
      })
      if (res.ok) {
        setIsCompleted(true)
        // Navigate to next lesson after a short delay
        if (nextLessonSlug) {
          setTimeout(() => {
            router.push(`/learn/courses/${courseSlug}/${nextLessonSlug}`)
            router.refresh()
          }, 500)
        } else {
          router.refresh()
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isCompleted) {
    return (
      <div className="text-primary flex items-center gap-2 text-sm font-semibold">
        <Check className="h-4 w-4" />
        Completed
      </div>
    )
  }

  return (
    <button
      onClick={handleComplete}
      disabled={isLoading}
      className="bg-primary hover:bg-primary/90 inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold tracking-[0.015em] text-white transition-colors disabled:opacity-50"
    >
      {isLoading ? 'Saving...' : 'Mark as Complete'}
    </button>
  )
}
