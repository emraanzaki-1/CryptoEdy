import { Lock, CandlestickChart, LineChart, Network } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { SectionHeading } from '@/components/common/section-heading'
import { Title } from '@/components/ui/typography'
import { LAYOUT } from '@/lib/config/layout'

/** Map course slug → icon. Falls back to CandlestickChart. */
const COURSE_ICONS: Record<string, LucideIcon> = {
  'crypto-trading-101': CandlestickChart,
  'advanced-technical-analysis': LineChart,
  'defi-architecture': Network,
}

/** Map difficulty → badge color. */
const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-secondary-container text-on-secondary-container',
  intermediate: 'bg-primary-fixed text-on-primary-fixed-variant',
  advanced: 'bg-tertiary-fixed text-on-tertiary-fixed',
}

interface Course {
  id: string | number
  title: string
  slug: string
  excerpt: string
  difficulty: string
  estimatedDuration?: string | null
  isProOnly?: boolean
}

interface CoursesCurriculumProps {
  courses: Course[]
}

export function CoursesCurriculum({ courses }: CoursesCurriculumProps) {
  return (
    <section
      id="curriculum"
      className={`bg-surface-container-low rounded-2xl ${LAYOUT.spacing.section}`}
    >
      <SectionHeading
        variant="landing"
        overline="Curriculum"
        subtitle="Foundational and advanced modules structured for comprehensive mastery."
      >
        Structured Learning Paths
      </SectionHeading>

      {courses.length === 0 ? (
        <p className="text-on-surface-variant text-body-sm mt-10 text-center">
          Courses coming soon. Check back shortly.
        </p>
      ) : (
        <div
          className={`mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${LAYOUT.spacing.gridGap}`}
        >
          {courses.map((course) => {
            const Icon = COURSE_ICONS[course.slug] ?? CandlestickChart
            const diffColor = DIFFICULTY_COLORS[course.difficulty] ?? DIFFICULTY_COLORS.beginner

            return (
              <div
                key={course.id}
                className={`bg-surface-container-lowest shadow-ambient group relative flex flex-col overflow-hidden rounded-2xl ${LAYOUT.spacing.card} ${LAYOUT.spacing.cardGap}`}
              >
                {/* Locked indicator */}
                <div className="bg-surface-container-high text-on-surface-variant text-overline absolute top-4 right-4 flex items-center gap-1 rounded-full px-3 py-1 font-bold uppercase">
                  <Lock className="size-3" />
                  Locked
                </div>

                {/* Icon */}
                <div className="bg-primary-fixed text-primary flex size-12 items-center justify-center rounded-xl">
                  <Icon className="size-6" />
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col gap-2">
                  <Title as="h3" className="group-hover:text-primary transition-colors">
                    {course.title}
                  </Title>
                  <p className="text-on-surface-variant text-body-sm">{course.excerpt}</p>
                </div>

                {/* Footer meta */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <span
                    className={`text-overline rounded-full px-2.5 py-1 font-bold uppercase ${diffColor}`}
                  >
                    {course.difficulty}
                  </span>
                  {course.estimatedDuration && (
                    <span className="text-on-surface-variant text-overline font-medium">
                      {course.estimatedDuration}
                    </span>
                  )}
                  {course.isProOnly && (
                    <span className="bg-tertiary-fixed text-on-tertiary-fixed text-overline flex items-center gap-1 rounded-full px-2.5 py-1 font-bold uppercase">
                      <Lock className="size-3" /> Pro
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
