'use client'

import { useState } from 'react'
import { CourseCard } from '@/components/learn/course-card'
import { ActiveCourseCard } from '@/components/learn/active-course-card'
import { Title } from '@/components/ui/typography'
import { EmptyState } from '@/components/common/empty-state'
import { cn } from '@/lib/utils'

interface CourseData {
  id: number
  title: string
  excerpt: string
  slug: string
  coverImageUrl?: string
  coverImageAlt?: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedDuration?: string
  isProOnly: boolean
}

interface EnrollmentData {
  enrolled: boolean
  progressPercent: number
  moduleCount: number
  firstIncompleteLessonSlug?: string
}

interface CoursesClientProps {
  courses: CourseData[]
  enrollmentMap: Record<number, EnrollmentData>
}

const DIFFICULTY_TABS = ['all', 'beginner', 'intermediate', 'advanced'] as const

export function CoursesClient({ courses, enrollmentMap }: CoursesClientProps) {
  const [activeTab, setActiveTab] = useState<(typeof DIFFICULTY_TABS)[number]>('all')

  // Split courses into enrolled (active) and all
  const activeCourses = courses.filter((c) => enrollmentMap[c.id]?.enrolled)
  const filteredCourses =
    activeTab === 'all' ? courses : courses.filter((c) => c.difficulty === activeTab)

  return (
    <>
      {/* Active Courses Section */}
      {activeCourses.length > 0 && (
        <section className="mb-16">
          <div className="mb-8 flex items-center justify-between">
            <Title>Active Courses</Title>
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {activeCourses.map((course) => {
              const enrollment = enrollmentMap[course.id]
              return (
                <ActiveCourseCard
                  key={course.id}
                  title={course.title}
                  slug={course.slug}
                  coverImageUrl={course.coverImageUrl}
                  coverImageAlt={course.coverImageAlt}
                  progressPercent={enrollment.progressPercent}
                  moduleCount={enrollment.moduleCount}
                  firstIncompleteLessonSlug={enrollment.firstIncompleteLessonSlug}
                />
              )
            })}
          </div>
        </section>
      )}

      {/* Filter Tabs + Course Grid */}
      <section>
        <div className="border-outline-variant/[0.15] mb-8 flex items-center justify-between border-b pb-4">
          <div className="flex gap-4 overflow-x-auto sm:gap-8">
            {DIFFICULTY_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'text-body-sm -mb-[17px] pb-4 font-bold transition-colors',
                  activeTab === tab
                    ? 'text-primary border-primary border-b-2'
                    : 'text-outline hover:text-on-surface'
                )}
                type="button"
              >
                {tab === 'all' ? 'All Courses' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {filteredCourses.map((course) => {
              const enrollment = enrollmentMap[course.id]
              return (
                <CourseCard
                  key={course.id}
                  title={course.title}
                  excerpt={course.excerpt}
                  slug={course.slug}
                  coverImageUrl={course.coverImageUrl}
                  coverImageAlt={course.coverImageAlt}
                  difficulty={course.difficulty}
                  estimatedDuration={course.estimatedDuration}
                  isProOnly={course.isProOnly}
                  isEnrolled={enrollment?.enrolled ?? false}
                  progressPercent={enrollment?.progressPercent ?? 0}
                />
              )
            })}
          </div>
        ) : (
          <EmptyState
            title="No courses found"
            message="Try a different filter or check back later."
          />
        )}
      </section>
    </>
  )
}
