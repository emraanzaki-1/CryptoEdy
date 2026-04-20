import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { SerializedEditorState } from 'lexical'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { getLessonBySlug } from '@/lib/courses/getLesson'
import { getCourseBySlug } from '@/lib/courses/getCourses'
import { getCourseModulesWithLessons } from '@/lib/courses/getModules'
import { getEnrollment, getCompletedLessonIds } from '@/lib/courses/progress'
import { isLessonUnlocked, getNextLesson, getPreviousLesson } from '@/lib/courses/lessonAccess'
import { VideoPlayer } from '@/components/learn/video-player'
import { MarkCompleteButton } from '@/components/learn/mark-complete-button'
import { LessonNav } from '@/components/learn/lesson-nav'
import { ModuleAccordion } from '@/components/learn/module-accordion'
import { auth } from '@/lib/auth'
import { jsxConverters } from '@/lib/lexical/jsxConverters'
import { Clock } from 'lucide-react'

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseSlug: string; lessonSlug: string }>
}) {
  const { courseSlug, lessonSlug } = await params

  const course = await getCourseBySlug(courseSlug)
  if (!course) notFound()

  const lesson = await getLessonBySlug(lessonSlug)
  if (!lesson) notFound()

  const courseId = course.id as number
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
        <h1 className="text-on-surface text-2xl font-bold tracking-[-0.04em]">
          Enroll to Access This Lesson
        </h1>
        <p className="text-on-surface-variant text-base">
          You need to enroll in this course to access its lessons.
        </p>
        <Link
          href={`/learn/courses/${courseSlug}`}
          className="bg-primary hover:bg-primary/90 inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold tracking-[0.015em] text-white transition-colors"
        >
          View Course
        </Link>
      </div>
    )
  }

  if (!unlocked && !isFreePreview) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 py-20 text-center">
        <h1 className="text-on-surface text-2xl font-bold tracking-[-0.04em]">Lesson Locked</h1>
        <p className="text-on-surface-variant text-base">
          Complete the previous lesson to unlock this one.
        </p>
        <Link
          href={`/learn/courses/${courseSlug}`}
          className="bg-primary hover:bg-primary/90 inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold tracking-[0.015em] text-white transition-colors"
        >
          Back to Course
        </Link>
      </div>
    )
  }

  const isCompleted = completedIds.has(lessonId)
  const nextLesson = getNextLesson(lessonId, modules)
  const prevLesson = getPreviousLesson(lessonId, modules)

  // Find which module this lesson belongs to
  const currentModule = modules.find((m) => m.lessons.some((l) => l.id === lessonId))

  return (
    <div className="mx-auto flex w-full max-w-6xl gap-8">
      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col gap-8">
        {/* Breadcrumb */}
        <nav className="text-on-surface-variant flex flex-wrap items-center gap-1.5 text-sm">
          <Link href="/learn" className="hover:text-on-surface transition-colors">
            Learn
          </Link>
          <span>/</span>
          <Link href="/learn/courses" className="hover:text-on-surface transition-colors">
            Courses
          </Link>
          <span>/</span>
          <Link
            href={`/learn/courses/${courseSlug}`}
            className="hover:text-on-surface transition-colors"
          >
            {course.title}
          </Link>
          {currentModule && (
            <>
              <span>/</span>
              <span>{currentModule.title}</span>
            </>
          )}
          <span>/</span>
          <span className="text-on-surface font-medium">{lesson.title}</span>
        </nav>

        {/* Lesson title */}
        <div className="flex flex-col gap-2">
          <h1 className="text-on-surface text-2xl font-bold tracking-[-0.04em] lg:text-3xl">
            {lesson.title}
          </h1>
          {lesson.estimatedDuration && (
            <div className="text-on-surface-variant flex items-center gap-1.5 text-sm">
              <Clock className="h-4 w-4" />
              {lesson.estimatedDuration} min
            </div>
          )}
        </div>

        {/* Video */}
        {lesson.videoUrl && <VideoPlayer url={lesson.videoUrl} title={lesson.title} />}

        {/* Content */}
        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <RichText data={lesson.content as SerializedEditorState} converters={jsxConverters} />
        </article>

        {/* Mark Complete + Nav */}
        <div className="flex flex-col gap-6 pb-8">
          {enrollment && (
            <div className="flex justify-end">
              <MarkCompleteButton
                lessonId={lessonId}
                courseId={courseId}
                isCompleted={isCompleted}
                nextLessonSlug={nextLesson?.slug}
                courseSlug={courseSlug}
              />
            </div>
          )}
          <LessonNav courseSlug={courseSlug} prevLesson={prevLesson} nextLesson={nextLesson} />
        </div>
      </div>

      {/* Sidebar — course outline (desktop only) */}
      <aside className="hidden w-80 flex-shrink-0 lg:block">
        <div className="sticky top-24 flex flex-col gap-4">
          <h2 className="text-on-surface text-sm font-bold tracking-[-0.04em]">Course Outline</h2>
          {modules.map((mod, index) => (
            <ModuleAccordion
              key={mod.id}
              title={mod.title}
              description={mod.description}
              moduleIndex={index}
              courseSlug={courseSlug}
              defaultOpen={mod.id === currentModule?.id}
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
      </aside>
    </div>
  )
}
