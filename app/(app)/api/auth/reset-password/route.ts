import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { rateLimit } from '@/lib/auth/rate-limit'

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
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

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
