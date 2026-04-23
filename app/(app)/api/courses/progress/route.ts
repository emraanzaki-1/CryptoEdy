import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getCompletedLessonIds, markLessonComplete, getEnrollment } from '@/lib/courses/progress'
import { getCourseModulesWithLessons } from '@/lib/courses/getModules'
import { isLessonUnlocked } from '@/lib/courses/lessonAccess'
import { rateLimit } from '@/lib/auth/rate-limit'
import { checkCsrf } from '@/lib/auth/csrf'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const courseId = req.nextUrl.searchParams.get('courseId')
  if (!courseId || isNaN(Number(courseId))) {
    return NextResponse.json({ error: 'courseId is required' }, { status: 400 })
  }

  try {
    const completedIds = await getCompletedLessonIds(session.user.id, Number(courseId))
    return NextResponse.json({ completedLessonIds: Array.from(completedIds) })
  } catch (err) {
    console.error('[courses/progress] GET error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const csrf = checkCsrf(req)
  if (csrf) return csrf

  const blocked = rateLimit(req, { maxRequests: 30, windowSec: 60 })
  if (blocked) return blocked

  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { lessonId, courseId } = await req.json()
    if (!lessonId || typeof lessonId !== 'number') {
      return NextResponse.json({ error: 'lessonId (number) is required' }, { status: 400 })
    }
    if (!courseId || typeof courseId !== 'number') {
      return NextResponse.json({ error: 'courseId (number) is required' }, { status: 400 })
    }

    // Verify enrollment
    const enrollment = await getEnrollment(session.user.id, courseId)
    if (!enrollment) {
      return NextResponse.json({ error: 'Not enrolled in this course' }, { status: 403 })
    }

    // Verify sequential unlocking
    const modules = await getCourseModulesWithLessons(courseId)
    const completedIds = await getCompletedLessonIds(session.user.id, courseId)

    if (!isLessonUnlocked(lessonId, modules, completedIds)) {
      return NextResponse.json({ error: 'Complete the previous lesson first' }, { status: 403 })
    }

    const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0)
    const record = await markLessonComplete(session.user.id, lessonId, courseId, totalLessons)
    return NextResponse.json({ completed: true, record })
  } catch (err) {
    console.error('[courses/progress] POST error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
