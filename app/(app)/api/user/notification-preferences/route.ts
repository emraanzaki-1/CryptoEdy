import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  getPreferences,
  updatePreference,
  isValidPreferenceKey,
} from '@/lib/notifications/preferences'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const prefs = await getPreferences(session.user.id)
    return NextResponse.json(prefs)
  } catch (err) {
    console.error('[notification-preferences] GET error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { key, enabled } = await req.json()

    if (typeof key !== 'string' || !isValidPreferenceKey(key)) {
      return NextResponse.json({ error: 'Invalid preference key' }, { status: 400 })
    }

    if (typeof enabled !== 'boolean') {
      return NextResponse.json({ error: 'enabled must be a boolean' }, { status: 400 })
    }

    const prefs = await updatePreference(session.user.id, key, enabled)
    return NextResponse.json(prefs)
  } catch (err) {
    console.error('[notification-preferences] PATCH error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
