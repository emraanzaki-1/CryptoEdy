'use client'

import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface LessonNavProps {
  courseSlug: string
  prevLesson?: { slug: string; title: string } | null
  nextLesson?: { slug: string; title: string } | null
}

export function LessonNav({ courseSlug, prevLesson, nextLesson }: LessonNavProps) {
  return (
    <div className="border-outline-variant/10 flex items-center justify-between border-t pt-6">
      {prevLesson ? (
        <Link
          href={`/learn/courses/${courseSlug}/${prevLesson.slug}`}
          className="text-on-surface-variant hover:text-on-surface flex items-center gap-2 text-sm transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <div className="flex flex-col">
            <span className="text-xs tracking-[0.05em] uppercase">Previous</span>
            <span className="font-medium">{prevLesson.title}</span>
          </div>
        </Link>
      ) : (
        <div />
      )}

      {nextLesson ? (
        <Link
          href={`/learn/courses/${courseSlug}/${nextLesson.slug}`}
          className="text-on-surface-variant hover:text-on-surface flex items-center gap-2 text-right text-sm transition-colors"
        >
          <div className="flex flex-col">
            <span className="text-xs tracking-[0.05em] uppercase">Next</span>
            <span className="font-medium">{nextLesson.title}</span>
          </div>
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <div />
      )}
    </div>
  )
}
