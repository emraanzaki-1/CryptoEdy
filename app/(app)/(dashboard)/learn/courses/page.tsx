import { getCourses } from '@/lib/courses/getCourses'
import { getUserEnrollments, getCompletedLessonIds } from '@/lib/courses/progress'
import { getCourseModulesWithLessons } from '@/lib/courses/getModules'
import { CoursesClient } from '@/components/learn/courses-client'
import { EmptyState } from '@/components/common/empty-state'
import { auth } from '@/lib/auth'
import { PageHeading } from '@/components/common/page-heading'

export default async function CoursesListingPage() {
  const courses = await getCourses()
  const session = await auth()

  // Build enrollment map with progress + module count + first incomplete lesson
  const enrollmentMap: Record<
    number,
    {
      enrolled: boolean
      progressPercent: number
      moduleCount: number
      firstIncompleteLessonSlug?: string
    }
  > = {}

  if (session?.user?.id) {
    const enrollments = await getUserEnrollments(session.user.id)
    if (enrollments.length > 0) {
      const enrolledCourseIds = enrollments.map((e) => e.courseId)

      const [allModules, allCompleted] = await Promise.all([
        Promise.all(enrolledCourseIds.map((id) => getCourseModulesWithLessons(id))),
        Promise.all(enrolledCourseIds.map((id) => getCompletedLessonIds(session.user!.id!, id))),
      ])

      for (let i = 0; i < enrollments.length; i++) {
        const modules = allModules[i]
        const completedIds = allCompleted[i]
        const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0)
        const progressPercent =
          totalLessons > 0 ? Math.round((completedIds.size / totalLessons) * 100) : 0

        // Find first incomplete lesson
        const flatLessons = modules.flatMap((m) => m.lessons)
        const firstIncomplete = flatLessons.find((l) => !completedIds.has(l.id))

        enrollmentMap[enrollments[i].courseId] = {
          enrolled: true,
          progressPercent,
          moduleCount: modules.length,
          firstIncompleteLessonSlug: firstIncomplete?.slug,
        }
      }
    }
  }

  // Map courses to serializable data
  const courseData = courses.map((course) => {
    const coverImage =
      course.coverImage &&
      typeof course.coverImage === 'object' &&
      'url' in (course.coverImage as Record<string, unknown>)
        ? ((course.coverImage as Record<string, unknown>).url as string)
        : undefined
    const coverImageAlt =
      course.coverImage &&
      typeof course.coverImage === 'object' &&
      'alt' in (course.coverImage as Record<string, unknown>)
        ? (((course.coverImage as Record<string, unknown>).alt as string) ?? course.title)
        : course.title

    return {
      id: course.id as number,
      title: course.title,
      excerpt: course.excerpt,
      slug: course.slug,
      coverImageUrl: coverImage,
      coverImageAlt,
      difficulty: course.difficulty as 'beginner' | 'intermediate' | 'advanced',
      estimatedDuration: course.estimatedDuration ?? undefined,
      isProOnly: course.isProOnly ?? false,
    }
  })

  return (
    <div className="mx-auto flex w-full flex-col gap-8">
      {/* Header */}
      <PageHeading subtitle="Master the digital economy with expert-led courses designed for institutional-grade research and tactical market analysis.">
        Courses
      </PageHeading>

      {courses.length > 0 ? (
        <CoursesClient courses={courseData} enrollmentMap={enrollmentMap} />
      ) : (
        <EmptyState
          title="No courses yet"
          message="Trading courses will appear here once published."
        />
      )}
    </div>
  )
}
