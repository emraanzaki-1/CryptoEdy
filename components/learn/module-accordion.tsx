'use client'

import { ChevronDown, CheckCircle2, Circle, Lock, Play, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import Link from 'next/link'

interface LessonItemProps {
  title: string
  slug: string
  courseSlug: string
  estimatedDuration?: number
  isCompleted: boolean
  isUnlocked: boolean
  isCurrent?: boolean
  hasVideo?: boolean
}

function LessonItem({
  title,
  slug,
  courseSlug,
  estimatedDuration,
  isCompleted,
  isUnlocked,
  isCurrent,
  hasVideo,
}: LessonItemProps) {
  const content = (
    <div
      className={cn(
        'flex items-center justify-between px-6 py-4 transition-colors',
        isUnlocked && !isCurrent && 'hover:bg-surface-container-low/30 cursor-pointer',
        isCurrent && 'bg-surface-container-low/10',
        !isUnlocked && 'cursor-not-allowed'
      )}
    >
      <div className="flex items-center gap-6">
        {/* Status icon */}
        <div className="flex-shrink-0">
          {isCompleted ? (
            <CheckCircle2 className="text-secondary h-5 w-5" />
          ) : isCurrent ? (
            <Play className="text-primary h-5 w-5" />
          ) : !isUnlocked ? (
            <Circle className="text-on-surface-variant h-5 w-5" />
          ) : hasVideo ? (
            <Play className="text-on-surface-variant h-5 w-5" />
          ) : (
            <FileText className="text-on-surface-variant h-5 w-5" />
          )}
        </div>

        {/* Title + Duration */}
        <div>
          <p
            className={cn(
              'text-sm',
              isCompleted && 'font-semibold',
              isCurrent && 'text-primary font-bold',
              !isUnlocked && !isCurrent && 'text-on-surface-variant',
              isUnlocked && !isCurrent && !isCompleted && 'font-semibold'
            )}
          >
            {title}
          </p>
          {estimatedDuration && (
            <p className="text-on-surface-variant/60 text-xs">{estimatedDuration} min</p>
          )}
        </div>
      </div>

      {/* Right side status */}
      <div className="flex-shrink-0">
        {isCompleted ? (
          <span className="text-secondary text-overline font-bold tracking-[0.05em] uppercase">
            Completed
          </span>
        ) : isCurrent ? (
          <span className="bg-primary text-overline rounded-lg px-4 py-2 font-bold text-white uppercase shadow-sm">
            Play Now
          </span>
        ) : !isUnlocked ? (
          <Lock className="text-on-surface-variant/40 h-4 w-4" />
        ) : null}
      </div>
    </div>
  )

  if (isUnlocked) {
    return <Link href={`/learn/courses/${courseSlug}/${slug}`}>{content}</Link>
  }
  return content
}

interface ModuleAccordionProps {
  title: string
  description?: string
  moduleIndex: number
  lessons: {
    id: number
    title: string
    slug: string
    estimatedDuration?: number
    isCompleted: boolean
    isUnlocked: boolean
    isCurrent?: boolean
    hasVideo?: boolean
  }[]
  courseSlug: string
  defaultOpen?: boolean
  moduleStatus?: 'completed' | 'active' | 'locked'
}

export function ModuleAccordion({
  title,
  description,
  moduleIndex,
  lessons,
  courseSlug,
  defaultOpen = false,
  moduleStatus = 'active',
}: ModuleAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const completedCount = lessons.filter((l) => l.isCompleted).length
  const totalCount = lessons.length

  const isLocked = moduleStatus === 'locked'
  const isCompleted = moduleStatus === 'completed'

  return (
    <div
      className={cn(
        'bg-surface-container-lowest overflow-hidden rounded-xl',
        isLocked && 'opacity-60',
        isOpen && !isLocked ? 'shadow-md' : 'shadow-sm'
      )}
    >
      {/* Header */}
      <button
        onClick={() => !isLocked && setIsOpen(!isOpen)}
        className={cn(
          'flex w-full items-center justify-between px-6 py-5 text-left transition-colors',
          !isLocked && 'hover:bg-surface-container-low cursor-pointer',
          isLocked && 'cursor-not-allowed',
          isOpen && !isLocked ? 'bg-surface-container-low' : 'bg-surface-container'
        )}
        type="button"
        disabled={isLocked}
      >
        <div className="flex items-center gap-4">
          {/* Circular status icon */}
          <div
            className={cn(
              'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full',
              isCompleted && 'bg-secondary-container text-on-secondary-container',
              moduleStatus === 'active' && 'bg-primary-container text-white',
              isLocked && 'bg-surface-container-high text-on-surface-variant'
            )}
          >
            {isCompleted ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : isLocked ? (
              <Lock className="h-5 w-5" />
            ) : (
              <Circle className="h-5 w-5" />
            )}
          </div>

          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'text-overline font-bold tracking-[0.05em] uppercase',
                  isCompleted && 'text-secondary',
                  moduleStatus === 'active' && 'text-primary',
                  isLocked && 'text-on-surface-variant'
                )}
              >
                Module {String(moduleIndex + 1).padStart(2, '0')}
              </span>
              <span className="text-on-surface-variant text-xs">
                {completedCount}/{totalCount} lessons
              </span>
            </div>
            <h3
              className={cn(
                'text-on-surface text-lg font-bold',
                isLocked && 'text-on-surface-variant'
              )}
            >
              {title}
            </h3>
            {description && <p className="text-on-surface-variant mt-0.5 text-sm">{description}</p>}
          </div>
        </div>

        <ChevronDown
          className={cn(
            'text-on-surface-variant h-5 w-5 flex-shrink-0 transition-transform duration-200',
            isOpen && !isLocked && 'rotate-180',
            isLocked && 'text-on-surface-variant/40'
          )}
        />
      </button>

      {/* Lessons */}
      {isOpen && !isLocked && (
        <div className="divide-surface-container-low divide-y">
          {lessons.map((lesson) => (
            <LessonItem
              key={lesson.id}
              title={lesson.title}
              slug={lesson.slug}
              courseSlug={courseSlug}
              estimatedDuration={lesson.estimatedDuration}
              isCompleted={lesson.isCompleted}
              isUnlocked={lesson.isUnlocked}
              isCurrent={lesson.isCurrent}
              hasVideo={lesson.hasVideo}
            />
          ))}
        </div>
      )}
    </div>
  )
}
