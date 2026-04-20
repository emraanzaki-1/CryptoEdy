import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { marketingSubscribers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { rateLimit } from '@/lib/auth/rate-limit'

export async function POST(req: NextRequest) {
  const blocked = rateLimit(req, { maxRequests: 5, windowSec: 60 })
  if (blocked) return blocked

  try {
    const { email } = await req.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
    }

    const db = getDb()

    // Check if already subscribed
    const [existing] = await db
      .select({ id: marketingSubscribers.id, active: marketingSubscribers.active })
      .from(marketingSubscribers)
      .where(eq(marketingSubscribers.email, normalizedEmail))
      .limit(1)

    if (existing) {
      if (!existing.active) {
        // Re-activate if previously unsubscribed
        await db
          .update(marketingSubscribers)
          .set({ active: true, unsubscribedAt: null, subscribedAt: new Date() })
          .where(eq(marketingSubscribers.id, existing.id))
      }
      // Don't reveal whether the email existed — always return success
      return NextResponse.json({ success: true })
    }

    await db.insert(marketingSubscribers).values({ email: normalizedEmail })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
