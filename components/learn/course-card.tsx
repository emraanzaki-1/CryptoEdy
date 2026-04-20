'use client'

import Link from 'next/link'
import { Clock, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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

const difficultyColors = {
  beginner: 'bg-green-500/15 text-green-700',
  intermediate: 'bg-amber-500/15 text-amber-700',
  advanced: 'bg-red-500/15 text-red-700',
} as const

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
      <article className="group border-outline-variant/[0.03] bg-surface-container-lowest relative flex w-full cursor-pointer flex-col overflow-hidden rounded-2xl border">
        {/* Cover Image */}
        {coverImageUrl && (
          <div className="bg-surface-container relative aspect-[16/9] overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
              role="img"
              aria-label={coverImageAlt ?? title}
              style={{ backgroundImage: `url('${coverImageUrl}')` }}
            />
            <div className="absolute top-3 left-3 flex items-center gap-2">
              {isProOnly && (
                <Badge variant="pro" className="shadow-sm">
                  PRO
                </Badge>
              )}
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize',
                  difficultyColors[difficulty]
                )}
              >
                {difficulty}
              </span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex flex-1 flex-col gap-3 p-5">
          <h3 className="text-on-surface group-hover:text-primary line-clamp-2 text-lg font-bold tracking-[-0.04em] transition-colors">
            {title}
          </h3>
          <p className="text-on-surface-variant line-clamp-2 text-sm leading-relaxed">{excerpt}</p>

          <div className="mt-auto flex items-center justify-between pt-3">
            <div className="text-on-surface-variant flex items-center gap-3 text-xs">
              {estimatedDuration && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {estimatedDuration}
                </span>
              )}
            </div>

            {isEnrolled ? (
              <div className="flex items-center gap-2">
                <div className="bg-surface-container h-1.5 w-20 overflow-hidden rounded-full">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-on-surface-variant text-xs">{progressPercent}%</span>
              </div>
            ) : (
              <span className="text-primary flex items-center gap-1 text-xs font-semibold">
                View Course
                <ChevronRight className="h-3.5 w-3.5" />
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
