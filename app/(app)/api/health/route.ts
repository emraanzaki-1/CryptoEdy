import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { sql } from 'drizzle-orm'

const isProduction = process.env.NODE_ENV === 'production'

export async function GET() {
  try {
    await getDb().execute(sql`SELECT 1`)
    return NextResponse.json({ status: 'ok' })
  } catch {
    // In production, don't reveal which subsystem failed
    return NextResponse.json(
      isProduction ? { status: 'error' } : { status: 'error', db: 'error' },
      { status: 503 }
    )
  }
}
