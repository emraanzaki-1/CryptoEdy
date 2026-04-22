import { NextRequest, NextResponse } from 'next/server'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getDb } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { verificationTokens } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { randomBytes } from 'crypto'
import { sendChangeEmailVerification } from '@/lib/email/send'
import { rateLimit } from '@/lib/auth/rate-limit'

const IDENTIFIER_PREFIX = 'email_change:'

/**
 * POST /api/user/change-email
 * Initiates an email change. Sends a verification link to the new address.
 */
export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { maxRequests: 3, windowSec: 300 })
  if (limited) return limited

  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await req.json()) as { newEmail?: string }
  const newEmail = body.newEmail?.trim().toLowerCase()

  if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  const [existingUser] = await getDb()
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.email, newEmail))
    .limit(1)

  if (existingUser) {
    return NextResponse.json({ error: 'This email is already in use' }, { status: 409 })
  }

  // Store pending email and generate a verification token
  const token = randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
  const identifier = IDENTIFIER_PREFIX + session.user.id

  await getDb()
    .update(users)
    .set({ pendingEmail: newEmail, updatedAt: new Date() })
    .where(eq(users.id, session.user.id))

  // Replace any existing email-change token for this user
  await getDb().delete(verificationTokens).where(eq(verificationTokens.identifier, identifier))

  await getDb().insert(verificationTokens).values({ identifier, token, expires })

  const BASE_URL = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  const verifyUrl = `${BASE_URL}/api/user/change-email/verify?token=${token}&uid=${session.user.id}`

  await sendChangeEmailVerification(newEmail, verifyUrl)

  return NextResponse.json({ ok: true })
}

/**
 * GET /api/user/change-email/verify?token=xxx&uid=xxx
 * Verifies the token and updates the user's email.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')
  const uid = searchParams.get('uid')
  const BASE_URL = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

  if (!token || !uid) {
    redirect(`${BASE_URL}/settings/profile?emailError=invalid`)
  }

  const identifier = IDENTIFIER_PREFIX + uid

  const [row] = await getDb()
    .select()
    .from(verificationTokens)
    .where(and(eq(verificationTokens.identifier, identifier), eq(verificationTokens.token, token)))
    .limit(1)

  if (!row) {
    redirect(`${BASE_URL}/settings/profile?emailError=invalid`)
  }

  if (row.expires < new Date()) {
    await getDb().delete(verificationTokens).where(eq(verificationTokens.identifier, identifier))
    redirect(`${BASE_URL}/settings/profile?emailError=expired`)
  }

  const [user] = await getDb()
    .select({ id: users.id, pendingEmail: users.pendingEmail })
    .from(users)
    .where(eq(users.id, uid))
    .limit(1)

  if (!user?.pendingEmail) {
    redirect(`${BASE_URL}/settings/profile?emailError=invalid`)
  }

  await getDb()
    .update(users)
    .set({ email: user.pendingEmail, pendingEmail: null, updatedAt: new Date() })
    .where(eq(users.id, uid))

  await getDb().delete(verificationTokens).where(eq(verificationTokens.identifier, identifier))

  redirect(`${BASE_URL}/settings/profile?emailChanged=true`)
}
