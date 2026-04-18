import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { generateSecureToken } from '@/lib/auth/referral'
import { sendVerificationEmail } from '@/lib/email/send'

// GET: Token-based verification (email link flow)
export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 })
    }

    const [user] = await getDb()
      .select()
      .from(users)
      .where(eq(users.verificationToken, token))
      .limit(1)

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
    }

    if (user.verificationTokenExpiry && user.verificationTokenExpiry < new Date()) {
      return NextResponse.json({ error: 'Token expired' }, { status: 400 })
    }

    await getDb()
      .update(users)
      .set({
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))

    return NextResponse.json({ message: 'Email verified successfully' })
  } catch (err) {
    console.error('[verify-email] Error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

// POST: Resend verification email
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const [user] = await getDb()
      .select({ id: users.id, email: users.email, emailVerified: users.emailVerified })
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1)

    // Always return success — never reveal if email exists
    if (!user || user.emailVerified) {
      return NextResponse.json({
        message: 'If an unverified account exists, a new verification email has been sent.',
      })
    }

    const verificationToken = generateSecureToken()
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h

    await getDb()
      .update(users)
      .set({
        verificationToken,
        verificationTokenExpiry,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))

    await sendVerificationEmail(user.email, verificationToken)

    return NextResponse.json({
      message: 'If an unverified account exists, a new verification email has been sent.',
    })
  } catch (err) {
    console.error('[verify-email] Resend error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
