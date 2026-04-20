'use client'

import Link from 'next/link'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CourseCardProps {
  title: string
  excerpt: string
  slug: string
  coverImageUrl?: string
  coverImageAlt?: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedDuration?: string
  isProOnly?: boolean
  isEnrolled?: boolean
  progressPercent?: number
}

export function CourseCard({
  title,
  excerpt,
  slug,
  coverImageUrl,
  coverImageAlt,
  difficulty,
  estimatedDuration,
  isProOnly,
  isEnrolled,
  progressPercent = 0,
}: CourseCardProps) {
  return (
    <Link href={`/learn/courses/${slug}`} className="flex h-full">
      <article className="bg-surface-container-lowest group relative flex w-full cursor-pointer flex-col overflow-hidden rounded-xl shadow-sm">
        {/* Cover Image */}
        {coverImageUrl && (
          <div className="bg-surface-container relative h-48 overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
              role="img"
              aria-label={coverImageAlt ?? title}
              style={{ backgroundImage: `url('${coverImageUrl}')` }}
            />
            {/* Level badge overlay */}
            <div className="absolute top-4 left-4">
              <span className="bg-on-surface/80 text-overline rounded px-2 py-1 font-bold tracking-[0.05em] text-white uppercase backdrop-blur-md">
                Level: {difficulty}
              </span>
            </div>
          </div>
        )}

        {/* No cover image — show level badge inline */}
        {!coverImageUrl && (
          <div className="bg-surface-container flex h-48 items-center justify-center">
            <span className="bg-on-surface/80 text-overline rounded px-2 py-1 font-bold tracking-[0.05em] text-white uppercase backdrop-blur-md">
              Level: {difficulty}
            </span>
          </div>
        )}

        {/* Content */}
        <div className="flex flex-1 flex-col gap-3 p-6">
          {/* Tier badge + Duration row */}
          <div className="flex items-center justify-between">
            {isProOnly ? (
              <span className="bg-secondary text-secondary-container text-overline rounded px-2 py-0.5 font-bold tracking-[0.05em] uppercase">
                PRO ONLY
              </span>
            ) : (
              <span className="bg-surface-container-high text-on-primary-fixed-variant text-overline rounded px-2 py-0.5 font-bold tracking-[0.05em] uppercase">
                ESSENTIAL
              </span>
            )}
            {estimatedDuration && (
              <span className="text-outline text-overline flex items-center gap-1 font-bold tracking-[0.05em] uppercase">
                <Clock className="h-3.5 w-3.5" />
                {estimatedDuration}
              </span>
            )}
          </div>

          <h3 className="text-on-surface group-hover:text-primary line-clamp-2 text-lg leading-tight font-bold tracking-[-0.04em] transition-colors">
            {title}
          </h3>
          <p className="text-on-surface-variant line-clamp-2 text-sm leading-relaxed">{excerpt}</p>

          {/* Bottom row */}
          <div className="border-outline-variant/[0.1] mt-auto flex items-center justify-between border-t pt-6">
            {isEnrolled ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="bg-surface-container h-1.5 w-20 overflow-hidden rounded-full">
                    <div
                      className="bg-secondary-container h-full rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <span className="text-secondary text-xs font-bold">{progressPercent}%</span>
                </div>
                <span className="bg-primary text-on-primary rounded-lg px-4 py-2 text-xs font-bold transition-colors">
                  Resume
                </span>
              </>
            ) : (
              <>
                <div />
                <span className="bg-surface-container-high hover:bg-surface-container text-primary rounded-lg px-4 py-2 text-xs font-bold transition-colors">
                  View Course
                </span>
              </>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
