import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  getUserPreferences,
  updatePreference,
  updateCategoryPreferences,
  NOTIFICATION_SUBTYPES,
} from '@/lib/notifications/preferences'
import type { NotificationType, NotificationSubtype } from '@/lib/db/schema/notifications'

const VALID_TYPES = Object.keys(NOTIFICATION_SUBTYPES) as NotificationType[]

function isValidType(val: string): val is NotificationType {
  return VALID_TYPES.includes(val as NotificationType)
}

function isValidSubtype(type: NotificationType, val: string): val is NotificationSubtype {
  return (NOTIFICATION_SUBTYPES[type] as string[]).includes(val)
}

function isValidChannel(val: string): val is 'inApp' | 'email' {
  return val === 'inApp' || val === 'email'
}

/** GET — returns all preferences grouped by type. */
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const prefs = await getUserPreferences(session.user.id)
    return NextResponse.json(prefs)
  } catch (err) {
    console.error('[notification-preferences] GET error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

/** PATCH — update a single preference toggle: { type, subtype, channel, enabled }. */
export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { type, subtype, channel, enabled } = await req.json()

    if (typeof type !== 'string' || !isValidType(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
    if (typeof subtype !== 'string' || !isValidSubtype(type, subtype)) {
      return NextResponse.json({ error: 'Invalid subtype' }, { status: 400 })
    }
    if (typeof channel !== 'string' || !isValidChannel(channel)) {
      return NextResponse.json(
        { error: 'Invalid channel — must be inApp or email' },
        { status: 400 }
      )
    }
    if (typeof enabled !== 'boolean') {
      return NextResponse.json({ error: 'enabled must be a boolean' }, { status: 400 })
    }

    const prefs = await updatePreference(session.user.id, type, subtype, channel, enabled)
    return NextResponse.json(prefs)
  } catch (err) {
    console.error('[notification-preferences] PATCH error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

/** PUT — master toggle: { type, channel, enabled } — updates all subtypes in a category. */
export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { type, channel, enabled } = await req.json()

    if (typeof type !== 'string' || !isValidType(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
    if (typeof channel !== 'string' || !isValidChannel(channel)) {
      return NextResponse.json(
        { error: 'Invalid channel — must be inApp or email' },
        { status: 400 }
      )
    }
    if (typeof enabled !== 'boolean') {
      return NextResponse.json({ error: 'enabled must be a boolean' }, { status: 400 })
    }

    const prefs = await updateCategoryPreferences(session.user.id, type, channel, enabled)
    return NextResponse.json(prefs)
  } catch (err) {
    console.error('[notification-preferences] PUT error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
