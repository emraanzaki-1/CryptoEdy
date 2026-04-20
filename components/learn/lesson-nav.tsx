'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'

interface LessonNavProps {
  courseSlug: string
  prevLesson?: { slug: string; title: string } | null
  nextLesson?: { slug: string; title: string } | null
}

export function LessonNav({ courseSlug, prevLesson, nextLesson }: LessonNavProps) {
  return (
    <div className="border-surface-container-high flex items-center justify-between border-t py-12">
      {prevLesson ? (
        <Link
          href={`/learn/courses/${courseSlug}/${prevLesson.slug}`}
          className="group flex max-w-xs items-center gap-4 text-left"
        >
          <div className="bg-surface-container text-primary group-hover:bg-primary flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-colors group-hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </div>
          <div>
            <span className="text-outline text-overline font-bold tracking-[0.05em] uppercase">
              Previous Lesson
            </span>
            <p className="text-on-surface group-hover:text-primary text-sm font-bold transition-colors">
              {prevLesson.title}
            </p>
          </div>
        </Link>
      ) : (
        <div />
      )}

      {nextLesson ? (
        <Link
          href={`/learn/courses/${courseSlug}/${nextLesson.slug}`}
          className="group flex max-w-xs items-center gap-4 text-right"
        >
          <div>
            <span className="text-outline text-overline font-bold tracking-[0.05em] uppercase">
              Up Next
            </span>
            <p className="text-on-surface group-hover:text-primary text-sm font-bold transition-colors">
              {nextLesson.title}
            </p>
          </div>
          <div className="bg-surface-container text-primary group-hover:bg-primary flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-colors group-hover:text-white">
            <ArrowRight className="h-5 w-5" />
          </div>
        </Link>
      ) : (
        <div />
      )}
    </div>
  )
}
