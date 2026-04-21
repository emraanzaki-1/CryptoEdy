'use client'

import Link from 'next/link'
import { ArrowRight, PlayCircle } from 'lucide-react'

interface ActiveCourseCardProps {
  title: string
  slug: string
  coverImageUrl?: string
  coverImageAlt?: string
  progressPercent: number
  moduleCount: number
  firstIncompleteLessonSlug?: string
}

export function ActiveCourseCard({
  title,
  slug,
  coverImageUrl,
  coverImageAlt,
  progressPercent,
  moduleCount,
  firstIncompleteLessonSlug,
}: ActiveCourseCardProps) {
  const isStarted = progressPercent > 0
  const href = firstIncompleteLessonSlug
    ? `/learn/courses/${slug}/${firstIncompleteLessonSlug}`
    : `/learn/courses/${slug}`

  return (
    <Link href={href} className="group block">
      <div className="bg-surface-container-lowest relative flex items-center gap-8 overflow-hidden rounded-xl p-8 shadow-sm">
        {/* Decorative background circle */}
        <div className="bg-secondary-container/10 absolute top-0 right-0 -mt-16 -mr-16 h-32 w-32 rounded-full transition-transform group-hover:scale-110" />

        {/* Thumbnail */}
        <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-xl">
          {coverImageUrl ? (
            <div
              className="absolute inset-0 bg-cover bg-center"
              role="img"
              aria-label={coverImageAlt ?? title}
              style={{ backgroundImage: `url('${coverImageUrl}')` }}
            />
          ) : (
            <div className="bg-surface-container flex h-full w-full items-center justify-center">
              <PlayCircle className="text-on-surface-variant h-10 w-10" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="relative flex-grow">
          <div className="mb-2 flex items-center gap-2">
            {isStarted ? (
              <span className="bg-secondary-container text-on-secondary-container text-overline font-bolduppercase rounded-full px-2 py-0.5">
                In Progress
              </span>
            ) : (
              <span className="bg-surface-container-high text-on-primary-fixed-variant text-overline font-bolduppercase rounded-full px-2 py-0.5">
                Up Next
              </span>
            )}
            <span className="text-outline text-overline font-bolduppercase">
              {moduleCount} modules
            </span>
          </div>

          <h3 className="text-on-surface text-subtitle mb-4 font-bold">{title}</h3>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-on-surface-variant">Course Progress</span>
              <span className={isStarted ? 'text-secondary' : 'text-outline'}>
                {progressPercent}%
              </span>
            </div>
            <div className="bg-surface-container h-2 w-full overflow-hidden rounded-full">
              <div
                className={`h-full rounded-full ${isStarted ? 'bg-secondary-container' : 'bg-primary-container'}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="text-primary text-body-sm mt-6 flex items-center gap-2 font-bold">
            {isStarted ? (
              <>
                Resume Learning <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              <>
                Start Course <PlayCircle className="h-4 w-4" />
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
