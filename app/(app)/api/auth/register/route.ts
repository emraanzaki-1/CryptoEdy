import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { users, notificationPreferences } from '@/lib/db/schema'
import { eq, or } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { generateReferralCode, generateSecureToken } from '@/lib/auth/referral'
import { sendVerificationEmail } from '@/lib/email/send'
import { rateLimit } from '@/lib/auth/rate-limit'

export async function POST(req: NextRequest) {
  const blocked = rateLimit(req, { maxRequests: 5, windowSec: 60 })
  if (blocked) return blocked

  try {
    const { email, username, password } = await req.json()

    if (!email || !username || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    // Check for existing email or username
    const [existing] = await getDb()
      .select({ id: users.id, email: users.email, username: users.username })
      .from(users)
      .where(or(eq(users.email, email.toLowerCase()), eq(users.username, username)))
      .limit(1)

    if (existing) {
      if (existing.email === email.toLowerCase()) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 409 }
        )
      }
      return NextResponse.json({ error: 'This username is already taken' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const referralCode = generateReferralCode()
    const verificationToken = generateSecureToken()
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h

    const [user] = await getDb()
      .insert(users)
      .values({
        username,
        email: email.toLowerCase(),
        passwordHash,
        referralCode,
        verificationToken,
        verificationTokenExpiry,
      })
      .returning({ id: users.id, email: users.email })

    // Seed default notification preferences
    await getDb().insert(notificationPreferences).values({ userId: user.id }).onConflictDoNothing()

    await sendVerificationEmail(user.email, verificationToken)

    return NextResponse.json(
      { message: 'Account created. Check your email to verify.' },
      { status: 201 }
    )
  } catch (err) {
    console.error('[register] Registration error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
