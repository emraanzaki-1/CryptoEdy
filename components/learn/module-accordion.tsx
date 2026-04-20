'use client'

import { ChevronDown, Check, Lock, Play, FileText } from 'lucide-react'
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
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
        isUnlocked && !isCurrent && 'hover:bg-surface-container cursor-pointer',
        isCurrent && 'bg-primary/10 text-primary font-medium',
        !isUnlocked && 'cursor-not-allowed opacity-50'
      )}
    >
      {/* Status icon */}
      <div className="flex-shrink-0">
        {isCompleted ? (
          <div className="bg-primary flex h-5 w-5 items-center justify-center rounded-full">
            <Check className="h-3 w-3 text-white" />
          </div>
        ) : !isUnlocked ? (
          <Lock className="text-on-surface-variant h-4 w-4" />
        ) : hasVideo ? (
          <Play className="text-on-surface-variant h-4 w-4" />
        ) : (
          <FileText className="text-on-surface-variant h-4 w-4" />
        )}
      </div>

      {/* Title */}
      <span className={cn('flex-1', !isUnlocked && 'text-on-surface-variant')}>{title}</span>

      {/* Duration */}
      {estimatedDuration && (
        <span className="text-on-surface-variant text-xs">{estimatedDuration} min</span>
      )}
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
}

export function ModuleAccordion({
  title,
  description,
  moduleIndex,
  lessons,
  courseSlug,
  defaultOpen = false,
}: ModuleAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const completedCount = lessons.filter((l) => l.isCompleted).length
  const totalCount = lessons.length

  return (
    <div className="border-outline-variant/10 overflow-hidden rounded-xl border">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hover:bg-surface-container/50 flex w-full items-center justify-between px-5 py-4 text-left transition-colors"
        type="button"
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-on-surface-variant text-xs font-semibold tracking-[0.05em] uppercase">
              Module {moduleIndex + 1}
            </span>
            <span className="text-on-surface-variant text-xs">
              {completedCount}/{totalCount} lessons
            </span>
          </div>
          <h3 className="text-on-surface text-base font-bold tracking-[-0.04em]">{title}</h3>
          {description && <p className="text-on-surface-variant mt-0.5 text-sm">{description}</p>}
        </div>
        <ChevronDown
          className={cn(
            'text-on-surface-variant h-5 w-5 flex-shrink-0 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Lessons */}
      {isOpen && (
        <div className="border-outline-variant/10 border-t px-2 py-2">
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
