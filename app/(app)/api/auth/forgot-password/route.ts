import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { generateSecureToken } from '@/lib/auth/referral'
import { sendPasswordResetEmail } from '@/lib/email/send'
import { rateLimit } from '@/lib/auth/rate-limit'

export async function POST(req: NextRequest) {
  const blocked = rateLimit(req, { maxRequests: 5, windowSec: 300 })
  if (blocked) return blocked

  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const [user] = await getDb()
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1)

    // Always return success — never reveal whether an email exists
    if (!user) {
      return NextResponse.json({ message: 'If an account exists, a reset link has been sent.' })
    }

    const resetToken = generateSecureToken()
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1h

    await getDb()
      .update(users)
      .set({ resetPasswordToken: resetToken, resetPasswordTokenExpiry: resetTokenExpiry })
      .where(eq(users.id, user.id))

    await sendPasswordResetEmail(user.email, resetToken)

    return NextResponse.json({ message: 'If an account exists, a reset link has been sent.' })
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
