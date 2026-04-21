import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { SerializedEditorState } from 'lexical'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { getLessonBySlugForCourse } from '@/lib/courses/getLesson'
import { getCourseBySlug } from '@/lib/courses/getCourses'
import { getCourseModulesWithLessons } from '@/lib/courses/getModules'
import { getEnrollment, getCompletedLessonIds } from '@/lib/courses/progress'
import { isLessonUnlocked, getNextLesson, getPreviousLesson } from '@/lib/courses/lessonAccess'
import { VideoPlayer } from '@/components/learn/video-player'
import { ButtonLink } from '@/components/ui/button-link'
import { MarkCompleteButton } from '@/components/learn/mark-complete-button'
import { LessonNav } from '@/components/learn/lesson-nav'
import { ModuleAccordion } from '@/components/learn/module-accordion'
import { ProgressBar } from '@/components/learn/progress-bar'
import { auth } from '@/lib/auth'
import { jsxConverters } from '@/lib/lexical/jsxConverters'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Clock } from 'lucide-react'
import { Heading, Body } from '@/components/ui/typography'

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseSlug: string; lessonSlug: string }>
}) {
  const { courseSlug, lessonSlug } = await params

  const course = await getCourseBySlug(courseSlug)
  if (!course) notFound()

  const courseId = course.id as number
  const lesson = await getLessonBySlugForCourse(lessonSlug, courseId)
  if (!lesson) notFound()

  const lessonId = lesson.id as number
  const modules = await getCourseModulesWithLessons(courseId)

  const session = await auth()
  const enrollment = session?.user?.id ? await getEnrollment(session.user.id, courseId) : null
  const completedIds = session?.user?.id
    ? await getCompletedLessonIds(session.user.id, courseId)
    : new Set<number>()

  // Check if this lesson is accessible
  const unlocked = !!enrollment && isLessonUnlocked(lessonId, modules, completedIds)
  const isFreePreview = lesson.isFreePreview

  // If not enrolled or lesson is locked (and not a free preview), show gate
  if (!enrollment && !isFreePreview) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 py-20 text-center">
        <Heading as="h1">Enroll to Access This Lesson</Heading>
        <Body size="lg" className="text-on-surface-variant">
          You need to enroll in this course to access its lessons.
        </Body>
        <ButtonLink href={`/learn/courses/${courseSlug}`} variant="gradient" size="xl">
          View Course
        </ButtonLink>
      </div>
    )
  }

  if (!unlocked && !isFreePreview) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 py-20 text-center">
        <Heading as="h1">Lesson Locked</Heading>
        <Body size="lg" className="text-on-surface-variant">
          Complete the previous lesson to unlock this one.
        </Body>
        <ButtonLink href={`/learn/courses/${courseSlug}`} variant="gradient" size="xl">
          Back to Course
        </ButtonLink>
      </div>
    )
  }

  const isCompleted = completedIds.has(lessonId)
  const nextLesson = getNextLesson(lessonId, modules)
  const prevLesson = getPreviousLesson(lessonId, modules)

  // Find which module this lesson belongs to + lesson index within module
  const currentModule = modules.find((m) => m.lessons.some((l) => l.id === lessonId))
  const lessonIndexInModule = currentModule
    ? currentModule.lessons.findIndex((l) => l.id === lessonId) + 1
    : 0

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0)
  const completionPercent =
    totalLessons > 0 ? Math.round((completedIds.size / totalLessons) * 100) : 0

  // Build lesson label for video player
  const lessonLabel = currentModule
    ? `Lesson ${lessonIndexInModule}: ${currentModule.title}${lesson.estimatedDuration ? ` \u00B7 ${lesson.estimatedDuration} min` : ''}`
    : undefined

  // Compute module status
  function getModuleStatus(mod: (typeof modules)[number]): 'completed' | 'active' | 'locked' {
    if (!enrollment) return 'active'
    const allComplete = mod.lessons.every((l) => completedIds.has(l.id))
    if (allComplete && mod.lessons.length > 0) return 'completed'
    const hasUnlocked = mod.lessons.some((l) => isLessonUnlocked(l.id, modules, completedIds))
    if (hasUnlocked) return 'active'
    return 'locked'
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl gap-8">
      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col gap-8">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Learn', href: '/learn' },
            { label: 'Courses', href: '/learn/courses' },
            { label: course.title, href: `/learn/courses/${courseSlug}` },
            { label: lesson.title },
          ]}
        />

        {/* Lesson title */}
        <div className="flex flex-col gap-2">
          <Heading as="h1" size="md" className="md:text-headline-lg font-black">
            {lesson.title}
          </Heading>
          {lesson.estimatedDuration && (
            <div className="text-on-surface-variant text-body-sm flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {lesson.estimatedDuration} min
            </div>
          )}
        </div>

        {/* Video */}
        {lesson.videoUrl && (
          <VideoPlayer url={lesson.videoUrl} title={lesson.title} lessonLabel={lessonLabel} />
        )}

        {/* Content */}
        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <RichText data={lesson.content as SerializedEditorState} converters={jsxConverters} />
        </article>

        {/* Mark Complete + Nav */}
        <div className="flex flex-col gap-6 pb-8">
          {enrollment && (
            <MarkCompleteButton
              lessonId={lessonId}
              courseId={courseId}
              isCompleted={isCompleted}
              nextLessonSlug={nextLesson?.slug}
              courseSlug={courseSlug}
            />
          )}
          <LessonNav courseSlug={courseSlug} prevLesson={prevLesson} nextLesson={nextLesson} />
        </div>
      </div>

      {/* Sidebar — course outline (desktop only) */}
      <aside className="hidden w-80 flex-shrink-0 lg:block">
        <div className="sticky top-24 flex flex-col">
          {/* Progress header */}
          <div className="mb-6">
            <h2 className="text-on-surface text-body-lg font-bold">Course Outline</h2>
            <p className="text-on-surface-variant mt-1 text-xs font-medium">
              {completionPercent}% Completed
            </p>
            <div className="mt-4">
              <ProgressBar
                completedCount={completedIds.size}
                totalCount={totalLessons}
                variant="secondary"
                showPercent={false}
              />
            </div>
          </div>

          {/* Module list */}
          <div className="flex flex-col gap-4">
            {modules.map((mod, index) => (
              <ModuleAccordion
                key={mod.id}
                title={mod.title}
                description={mod.description}
                moduleIndex={index}
                courseSlug={courseSlug}
                defaultOpen={mod.id === currentModule?.id}
                moduleStatus={getModuleStatus(mod)}
                lessons={mod.lessons.map((l) => ({
                  id: l.id,
                  title: l.title,
                  slug: l.slug,
                  estimatedDuration: l.estimatedDuration,
                  isCompleted: completedIds.has(l.id),
                  isUnlocked: !!enrollment && isLessonUnlocked(l.id, modules, completedIds),
                  isCurrent: l.id === lessonId,
                  hasVideo: !!l.videoUrl,
                }))}
              />
            ))}
          </div>
        </div>
      </aside>
    </div>
  )
}
