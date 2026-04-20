import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { enrollInCourse, getEnrollment } from '@/lib/courses/progress'
import { getDb } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

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
    const enrollment = await getEnrollment(session.user.id, Number(courseId))
    return NextResponse.json({ enrolled: !!enrollment, enrollment })
  } catch (err) {
    console.error('[courses/enroll] GET error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { courseId } = await req.json()
    if (!courseId || typeof courseId !== 'number') {
      return NextResponse.json({ error: 'courseId (number) is required' }, { status: 400 })
    }

    // Verify user still exists in DB (JWT may outlive a DB reset)
    const [dbUser] = await getDb()
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1)
    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found. Please sign out and sign in again.' },
        { status: 401 }
      )
    }

    // Verify course exists and check paywall
    const payload = await getPayload({ config: configPromise })
    const course = await payload.findByID({ collection: 'courses', id: courseId, depth: 0 })
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    if (course.isProOnly && session.user.role === 'free') {
      return NextResponse.json(
        { error: 'Pro subscription required to enroll in this course' },
        { status: 403 }
      )
    }

    const enrollment = await enrollInCourse(session.user.id, courseId)
    return NextResponse.json({ enrolled: true, enrollment })
  } catch (err) {
    console.error('[courses/enroll] POST error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
