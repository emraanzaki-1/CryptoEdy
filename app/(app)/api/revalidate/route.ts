import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { timingSafeEqual } from 'crypto'

/**
 * POST /api/revalidate
 * Manual cache busting endpoint — protected by REVALIDATION_SECRET.
 * Body: { secret: string, path?: string, tag?: string }
 */
export async function POST(req: NextRequest) {
  const body = (await req.json()) as { secret?: string; path?: string; tag?: string }

  const expected = process.env.REVALIDATION_SECRET
  if (!body.secret || !expected) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }
  const a = Buffer.from(body.secret)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  if (!body.path && !body.tag) {
    return NextResponse.json({ error: 'Provide path or tag' }, { status: 400 })
  }

  if (body.tag) {
    revalidateTag(body.tag, 'max')
  }

  if (body.path) {
    revalidatePath(body.path, 'page')
  }

  return NextResponse.json({
    revalidated: true,
    path: body.path,
    tag: body.tag,
    timestamp: new Date().toISOString(),
  })
}
