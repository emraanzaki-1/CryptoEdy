import { notFound } from 'next/navigation'
import { getCourseBySlug } from '@/lib/courses/getCourses'
import { getCourseModulesWithLessons } from '@/lib/courses/getModules'
import { getEnrollment, getCompletedLessonIds } from '@/lib/courses/progress'
import { isLessonUnlocked } from '@/lib/courses/lessonAccess'
import { ModuleAccordion } from '@/components/learn/module-accordion'
import { EnrollButton } from '@/components/learn/enroll-button'
import { ProgressBar } from '@/components/learn/progress-bar'
import { auth } from '@/lib/auth'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Clock, TrendingUp } from 'lucide-react'
import { Heading, Overline } from '@/components/ui/typography'

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

  // Compute which module the user is currently on
  const flatLessons = modules.flatMap((m) => m.lessons)
  const firstIncompleteIndex = flatLessons.findIndex((l) => !completedIds.has(l.id))
  const currentModuleIndex =
    firstIncompleteIndex >= 0
      ? modules.findIndex((m) =>
          m.lessons.some((l) => l.id === flatLessons[firstIncompleteIndex].id)
        )
      : -1

  // Compute module status for each module
  function getModuleStatus(
    mod: (typeof modules)[number],
    modIndex: number
  ): 'completed' | 'active' | 'locked' {
    if (!enrollment) return modIndex === 0 ? 'active' : 'locked'
    const allComplete = mod.lessons.every((l) => completedIds.has(l.id))
    if (allComplete && mod.lessons.length > 0) return 'completed'
    const hasUnlocked = mod.lessons.some((l) => isLessonUnlocked(l.id, modules, completedIds))
    if (hasUnlocked) return 'active'
    return 'locked'
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Learn', href: '/learn' },
          { label: 'Courses', href: '/learn/courses' },
          { label: course.title },
        ]}
      />

      {/* Course Header */}
      <header className="flex flex-col gap-6">
        {/* Metadata badges */}
        <div className="flex flex-wrap items-center gap-4">
          <span className="bg-surface-container-high text-primary text-overline rounded-full px-3 py-1 font-bold uppercase">
            {course.difficulty}
          </span>
          {course.estimatedDuration && (
            <span className="text-on-surface-variant text-micro flex items-center gap-1 font-medium">
              <Clock className="h-4 w-4" />
              {course.estimatedDuration}
            </span>
          )}
          {enrollment && currentModuleIndex >= 0 && (
            <span className="text-on-surface-variant text-micro flex items-center gap-1 font-medium">
              <TrendingUp className="h-4 w-4" />
              Module {currentModuleIndex + 1} of {modules.length}
            </span>
          )}
        </div>

        {/* Large editorial heading */}
        <Heading as="h1" size="md" responsive className="max-w-2xl font-black">
          {course.title}
        </Heading>

        <p className="text-on-surface-variant text-body-lg max-w-2xl">{course.excerpt}</p>

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
              enrollment ? flatLessons.find((l) => !completedIds.has(l.id))?.slug : undefined
            }
          />
        </div>
      </header>

      {/* Curriculum Progression */}
      <section id="curriculum" className="flex flex-col gap-6">
        <Overline as="h2" className="text-on-surface-variant">
          Curriculum Progression
        </Overline>
        {modules.map((mod, index) => (
          <ModuleAccordion
            key={mod.id}
            title={mod.title}
            description={mod.description}
            moduleIndex={index}
            courseSlug={courseSlug}
            defaultOpen={index === currentModuleIndex || (currentModuleIndex === -1 && index === 0)}
            moduleStatus={getModuleStatus(mod, index)}
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
      </section>
    </div>
  )
}
