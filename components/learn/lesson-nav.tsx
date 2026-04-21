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
          <div className="bg-surface-container text-primary group-hover:bg-primary group-hover:text-on-primary flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </div>
          <div>
            <span className="text-outline text-overline font-bolduppercase">Previous Lesson</span>
            <p className="text-on-surface group-hover:text-primary text-body-sm font-bold transition-colors">
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
            <span className="text-outline text-overline font-bolduppercase">Up Next</span>
            <p className="text-on-surface group-hover:text-primary text-body-sm font-bold transition-colors">
              {nextLesson.title}
            </p>
          </div>
          <div className="bg-surface-container text-primary group-hover:bg-primary group-hover:text-on-primary flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-colors">
            <ArrowRight className="h-5 w-5" />
          </div>
        </Link>
      ) : (
        <div />
      )}
    </div>
  )
}
