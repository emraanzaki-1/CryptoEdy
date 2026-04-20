import { getCourses } from '@/lib/courses/getCourses'
import { getUserEnrollments, getCompletedLessonIds } from '@/lib/courses/progress'
import { getCourseModulesWithLessons } from '@/lib/courses/getModules'
import { CourseCard } from '@/components/learn/course-card'
import { EmptyState } from '@/components/common/empty-state'
import { auth } from '@/lib/auth'

export default async function CoursesListingPage() {
  const courses = await getCourses()
  const session = await auth()

  // Get enrollment + progress data for the logged-in user
  const enrollmentMap = new Map<number, { enrolled: boolean; progressPercent: number }>()
  if (session?.user?.id) {
    const enrollments = await getUserEnrollments(session.user.id)
    if (enrollments.length > 0) {
      const enrolledCourseIds = enrollments.map((e) => e.courseId)

      // Batch: fetch modules + lessons for all enrolled courses in parallel
      const [allModules, allCompleted] = await Promise.all([
        Promise.all(enrolledCourseIds.map((id) => getCourseModulesWithLessons(id))),
        Promise.all(enrolledCourseIds.map((id) => getCompletedLessonIds(session.user!.id!, id))),
      ])

      for (let i = 0; i < enrollments.length; i++) {
        const totalLessons = allModules[i].reduce((sum, m) => sum + m.lessons.length, 0)
        const progressPercent =
          totalLessons > 0 ? Math.round((allCompleted[i].size / totalLessons) * 100) : 0
        enrollmentMap.set(enrollments[i].courseId, { enrolled: true, progressPercent })
      }
    }
  }

  return (
    <div className="mx-auto flex w-full flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-on-surface text-2xl leading-tight font-bold tracking-[-0.04em] lg:text-3xl">
          Courses
        </h1>
        <p className="text-on-surface-variant mt-2 text-base">
          Structured learning paths — from crypto basics to advanced trading strategies.
        </p>
      </div>

      {/* Course Grid */}
      {courses.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const enrollment = enrollmentMap.get(course.id as number)
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

            return (
              <CourseCard
                key={course.id}
                title={course.title}
                excerpt={course.excerpt}
                slug={course.slug}
                coverImageUrl={coverImage}
                coverImageAlt={coverImageAlt}
                difficulty={course.difficulty as 'beginner' | 'intermediate' | 'advanced'}
                estimatedDuration={course.estimatedDuration ?? undefined}
                isProOnly={course.isProOnly ?? false}
                isEnrolled={enrollment?.enrolled ?? false}
                progressPercent={enrollment?.progressPercent ?? 0}
              />
            )
          })}
        </div>
      ) : (
        <EmptyState
          title="No courses yet"
          message="Trading courses will appear here once published."
        />
      )}
    </div>
  )
}
