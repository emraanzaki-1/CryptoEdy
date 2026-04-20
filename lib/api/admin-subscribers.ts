import type { Endpoint } from 'payload'
import { getDb } from '@/lib/db'
import { marketingSubscribers } from '@/lib/db/schema'
import { ilike, count, eq, desc } from 'drizzle-orm'

function isAdmin(req: { user?: Record<string, unknown> | null }): boolean {
  return (req.user as { role?: string } | null)?.role === 'admin'
}

export const adminSubscriberEndpoints: Endpoint[] = [
  {
    path: '/admin-subscribers',
    method: 'get',
    handler: async (req) => {
      if (!isAdmin(req)) {
        return Response.json({ error: 'Forbidden' }, { status: 403 })
      }

      const url = new URL(req.url!)
      const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1'))
      const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') ?? '20')))
      const search = url.searchParams.get('search') ?? ''
      const statusFilter = url.searchParams.get('status') ?? ''
      const offset = (page - 1) * limit

      const db = getDb()

      let query = db
        .select({
          id: marketingSubscribers.id,
          email: marketingSubscribers.email,
          active: marketingSubscribers.active,
          subscribedAt: marketingSubscribers.subscribedAt,
          unsubscribedAt: marketingSubscribers.unsubscribedAt,
        })
        .from(marketingSubscribers)
        .orderBy(desc(marketingSubscribers.subscribedAt))
        .limit(limit)
        .offset(offset)
        .$dynamic()

      let countQuery = db.select({ total: count() }).from(marketingSubscribers).$dynamic()

      // Apply filters
      if (search) {
        const searchCond = ilike(marketingSubscribers.email, `%${search}%`)
        query = query.where(searchCond)
        countQuery = countQuery.where(searchCond)
      }

      if (statusFilter === 'active') {
        query = query.where(eq(marketingSubscribers.active, true))
        countQuery = countQuery.where(eq(marketingSubscribers.active, true))
      } else if (statusFilter === 'unsubscribed') {
        query = query.where(eq(marketingSubscribers.active, false))
        countQuery = countQuery.where(eq(marketingSubscribers.active, false))
      }

      const [rows, [{ total }]] = await Promise.all([query, countQuery])

      return Response.json({
        docs: rows,
        totalDocs: total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      })
    },
  },

  // GET /api/admin-subscribers/export — download all subscribers as CSV
  {
    path: '/admin-subscribers/export',
    method: 'get',
    handler: async (req) => {
      if (!isAdmin(req)) {
        return Response.json({ error: 'Forbidden' }, { status: 403 })
      }

      const url = new URL(req.url!)
      const statusFilter = url.searchParams.get('status') ?? ''

      const db = getDb()

      let query = db
        .select({
          email: marketingSubscribers.email,
          active: marketingSubscribers.active,
          subscribedAt: marketingSubscribers.subscribedAt,
          unsubscribedAt: marketingSubscribers.unsubscribedAt,
        })
        .from(marketingSubscribers)
        .orderBy(desc(marketingSubscribers.subscribedAt))
        .$dynamic()

      if (statusFilter === 'active') {
        query = query.where(eq(marketingSubscribers.active, true))
      } else if (statusFilter === 'unsubscribed') {
        query = query.where(eq(marketingSubscribers.active, false))
      }

      const rows = await query

      const csvHeader = 'Email,Status,Subscribed At,Unsubscribed At'
      const csvRows = rows.map((r) => {
        const status = r.active ? 'Active' : 'Unsubscribed'
        const subscribedAt = r.subscribedAt ? new Date(r.subscribedAt).toISOString() : ''
        const unsubscribedAt = r.unsubscribedAt ? new Date(r.unsubscribedAt).toISOString() : ''
        return `${r.email},${status},${subscribedAt},${unsubscribedAt}`
      })
      const csv = [csvHeader, ...csvRows].join('\n')

      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      })
    },
  },
]
