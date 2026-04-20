import { notFound } from 'next/navigation'
import { getCourseBySlug } from '@/lib/courses/getCourses'
import { getCourseModulesWithLessons } from '@/lib/courses/getModules'
import { getEnrollment, getCompletedLessonIds } from '@/lib/courses/progress'
import { isLessonUnlocked } from '@/lib/courses/lessonAccess'
import { ModuleAccordion } from '@/components/learn/module-accordion'
import { EnrollButton } from '@/components/learn/enroll-button'
import { ProgressBar } from '@/components/learn/progress-bar'
import { Badge } from '@/components/ui/badge'
import { auth } from '@/lib/auth'
import { Clock, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { jsxConverters } from '@/lib/lexical/jsxConverters'
import type { SerializedEditorState } from 'lexical'

const difficultyColors = {
  beginner: 'bg-green-500/15 text-green-700',
  intermediate: 'bg-amber-500/15 text-amber-700',
  advanced: 'bg-red-500/15 text-red-700',
} as const

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseSlug: string }>
}) {
  const { courseSlug } = await params
  const course = await getCourseBySlug(courseSlug)
  if (!course) notFound()

  const courseId = course.id as number
  const modules = await getCourseModulesWithLessons(courseId)
  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0)

  const session = await auth()
  const enrollment = session?.user?.id ? await getEnrollment(session.user.id, courseId) : null
  const completedIds = session?.user?.id
    ? await getCompletedLessonIds(session.user.id, courseId)
    : new Set<number>()

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      {/* Breadcrumb */}
      <nav className="text-on-surface-variant flex items-center gap-1.5 text-sm">
        <Link href="/learn" className="hover:text-on-surface transition-colors">
          Learn
        </Link>
        <span>/</span>
        <Link href="/learn/courses" className="hover:text-on-surface transition-colors">
          Courses
        </Link>
        <span>/</span>
        <span className="text-on-surface font-medium">{course.title}</span>
      </nav>

      {/* Course Header */}
      <div className="flex flex-col gap-6">
        {/* Cover Image */}
        {course.coverImage &&
          typeof course.coverImage === 'object' &&
          'url' in (course.coverImage as Record<string, unknown>) && (
            <div className="bg-surface-container relative aspect-[21/9] overflow-hidden rounded-2xl">
              <div
                className="absolute inset-0 bg-cover bg-center"
                role="img"
                aria-label={
                  ((course.coverImage as Record<string, unknown>).alt as string) ?? course.title
                }
                style={{
                  backgroundImage: `url('${(course.coverImage as Record<string, unknown>).url as string}')`,
                }}
              />
            </div>
          )}

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {course.isProOnly && <Badge variant="pro">PRO</Badge>}
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${difficultyColors[course.difficulty as keyof typeof difficultyColors]}`}
            >
              {course.difficulty}
            </span>
          </div>

          <h1 className="text-on-surface text-2xl font-bold tracking-[-0.04em] lg:text-3xl">
            {course.title}
          </h1>

          <p className="text-on-surface-variant text-base leading-relaxed">{course.excerpt}</p>

          {course.description && (
            <div className="prose prose-sm text-on-surface-variant max-w-none">
              <RichText
                data={course.description as SerializedEditorState}
                converters={jsxConverters}
              />
            </div>
          )}

          <div className="text-on-surface-variant flex flex-wrap items-center gap-4 text-sm">
            {course.estimatedDuration && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {course.estimatedDuration}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4" />
              {modules.length} modules · {totalLessons} lessons
            </span>
          </div>

          {/* Enrollment + Progress */}
          <div className="flex flex-col gap-3 pt-2">
            {enrollment && (
              <ProgressBar completedCount={completedIds.size} totalCount={totalLessons} />
            )}
            <EnrollButton
              courseId={courseId}
              isEnrolled={!!enrollment}
              courseSlug={courseSlug}
              isProOnly={course.isProOnly ?? false}
              userRole={session?.user?.role ?? 'free'}
              firstIncompleteLessonSlug={
                enrollment
                  ? modules.flatMap((m) => m.lessons).find((l) => !completedIds.has(l.id))?.slug
                  : undefined
              }
            />
          </div>
        </div>
      </div>

      {/* Modules */}
      <div className="flex flex-col gap-4">
        <h2 className="text-on-surface text-xl font-bold tracking-[-0.04em]">Course Content</h2>
        {modules.map((mod, index) => (
          <ModuleAccordion
            key={mod.id}
            title={mod.title}
            description={mod.description}
            moduleIndex={index}
            courseSlug={courseSlug}
            defaultOpen={index === 0}
            lessons={mod.lessons.map((lesson) => ({
              id: lesson.id,
              title: lesson.title,
              slug: lesson.slug,
              estimatedDuration: lesson.estimatedDuration,
              isCompleted: completedIds.has(lesson.id),
              isUnlocked: !!enrollment && isLessonUnlocked(lesson.id, modules, completedIds),
              hasVideo: !!lesson.videoUrl,
            }))}
          />
        ))}
      </div>
    </div>
  )
}
