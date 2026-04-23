import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { rateLimit } from '@/lib/auth/rate-limit'
import { resetPasswordSchema } from '@/lib/auth/schemas'

// GET: Pre-validate reset token (does not consume the token)
export async function GET(req: NextRequest) {
  const blocked = rateLimit(req, { maxRequests: 10, windowSec: 60 })
  if (blocked) return blocked

  try {
    const token = req.nextUrl.searchParams.get('token')

    if (!token) {
      return NextResponse.json({ valid: false, error: 'Missing token' }, { status: 400 })
    }

    const [user] = await getDb()
      .select({ id: users.id, resetPasswordTokenExpiry: users.resetPasswordTokenExpiry })
      .from(users)
      .where(eq(users.resetPasswordToken, token))
      .limit(1)

    if (!user) {
      return NextResponse.json(
        { valid: false, error: 'Invalid or expired reset link' },
        { status: 400 }
      )
    }

    if (user.resetPasswordTokenExpiry && user.resetPasswordTokenExpiry < new Date()) {
      return NextResponse.json({ valid: false, error: 'Reset link has expired' }, { status: 400 })
    }

    return NextResponse.json({ valid: true })
  } catch {
    return NextResponse.json({ valid: false, error: 'Something went wrong' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const blocked = rateLimit(req, { maxRequests: 5, windowSec: 300 })
  if (blocked) return blocked

  try {
    const body = await req.json()
    const { token } = body as { token?: string }

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    const parsed = resetPasswordSchema.safeParse(body)
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? 'Invalid input'
      return NextResponse.json({ error: firstError }, { status: 400 })
    }

    const { password } = parsed.data

    const [user] = await getDb()
      .select()
      .from(users)
      .where(eq(users.resetPasswordToken, token))
      .limit(1)

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired reset link' }, { status: 400 })
    }

    if (user.resetPasswordTokenExpiry && user.resetPasswordTokenExpiry < new Date()) {
      return NextResponse.json({ error: 'Reset link has expired' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    await getDb()
      .update(users)
      .set({
        passwordHash,
        resetPasswordToken: null,
        resetPasswordTokenExpiry: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))

    return NextResponse.json({ message: 'Password reset successfully' })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
