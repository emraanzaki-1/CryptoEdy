import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { sql } from 'drizzle-orm'

export async function GET() {
  try {
    await getDb().execute(sql`SELECT 1`)
    return NextResponse.json({
      status: 'ok',
      db: 'ok',
      timestamp: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json(
      {
        status: 'error',
        db: 'error',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    )
  }
}
