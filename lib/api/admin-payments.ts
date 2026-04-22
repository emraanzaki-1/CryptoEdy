import type { Endpoint } from 'payload'
import { getDb } from '@/lib/db'
import { payments } from '@/lib/db/schema/payments'
import { users } from '@/lib/db/schema/users'
import { eq, ilike, count, desc, or, sql } from 'drizzle-orm'
import { addDataAndFileToRequest } from 'payload'

function isAdmin(req: { user?: Record<string, unknown> | null }): boolean {
  return (req.user as { role?: string } | null)?.role === 'admin'
}

export const adminPaymentEndpoints: Endpoint[] = [
  // GET /api/admin-payments — paginated list
  {
    path: '/admin-payments',
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
      const chainFilter = url.searchParams.get('chain') ?? ''
      const offset = (page - 1) * limit

      const db = getDb()

      const conditions = []
      if (search) {
        conditions.push(
          or(
            ilike(payments.txHash, `%${search}%`),
            ilike(users.email, `%${search}%`),
            ilike(users.displayName, `%${search}%`)
          )
        )
      }
      if (statusFilter) {
        conditions.push(eq(payments.status, statusFilter as 'confirmed' | 'pending' | 'failed'))
      }
      if (chainFilter) {
        conditions.push(eq(payments.chain, chainFilter))
      }

      const whereClause =
        conditions.length > 0
          ? conditions.length === 1
            ? conditions[0]
            : sql`${conditions[0]} AND ${conditions.slice(1).reduce((a, b) => sql`${a} AND ${b}`)}`
          : undefined

      const baseQuery = db
        .select({
          id: payments.id,
          txHash: payments.txHash,
          chain: payments.chain,
          asset: payments.asset,
          amount: payments.amount,
          status: payments.status,
          walletAddress: payments.walletAddress,
          recipientAddress: payments.recipientAddress,
          statusReason: payments.statusReason,
          adminNote: payments.adminNote,
          confirmedAt: payments.confirmedAt,
          createdAt: payments.createdAt,
          userId: payments.userId,
          userEmail: users.email,
          userDisplayName: users.displayName,
        })
        .from(payments)
        .leftJoin(users, eq(payments.userId, users.id))
        .orderBy(desc(payments.createdAt))

      const countBase = db
        .select({ total: count() })
        .from(payments)
        .leftJoin(users, eq(payments.userId, users.id))

      const query = whereClause
        ? baseQuery.where(whereClause).limit(limit).offset(offset)
        : baseQuery.limit(limit).offset(offset)

      const countQuery = whereClause ? countBase.where(whereClause) : countBase

      const [rows, [{ total }]] = await Promise.all([query, countQuery])

      const docs = rows.map((r) => ({
        id: r.id,
        txHash: r.txHash,
        chain: r.chain,
        asset: r.asset,
        amount: r.amount,
        status: r.status,
        walletAddress: r.walletAddress,
        recipientAddress: r.recipientAddress,
        statusReason: r.statusReason,
        adminNote: r.adminNote,
        confirmedAt: r.confirmedAt,
        createdAt: r.createdAt,
        user: {
          id: r.userId,
          email: r.userEmail,
          displayName: r.userDisplayName,
        },
      }))

      return Response.json({
        docs,
        totalDocs: total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      })
    },
  },

  // GET /api/admin-payments/:id — single payment detail
  {
    path: '/admin-payments/:id',
    method: 'get',
    handler: async (req) => {
      if (!isAdmin(req)) {
        return Response.json({ error: 'Forbidden' }, { status: 403 })
      }

      const id = req.routeParams?.id as string
      if (!id) return Response.json({ error: 'Missing id' }, { status: 400 })

      const db = getDb()
      const rows = await db
        .select({
          id: payments.id,
          txHash: payments.txHash,
          chain: payments.chain,
          asset: payments.asset,
          amount: payments.amount,
          status: payments.status,
          walletAddress: payments.walletAddress,
          recipientAddress: payments.recipientAddress,
          statusReason: payments.statusReason,
          adminNote: payments.adminNote,
          confirmedAt: payments.confirmedAt,
          createdAt: payments.createdAt,
          userId: payments.userId,
          userEmail: users.email,
          userDisplayName: users.displayName,
        })
        .from(payments)
        .leftJoin(users, eq(payments.userId, users.id))
        .where(eq(payments.id, id))
        .limit(1)

      if (rows.length === 0) {
        return Response.json({ error: 'Not found' }, { status: 404 })
      }

      const r = rows[0]
      return Response.json({
        id: r.id,
        txHash: r.txHash,
        chain: r.chain,
        asset: r.asset,
        amount: r.amount,
        status: r.status,
        walletAddress: r.walletAddress,
        recipientAddress: r.recipientAddress,
        statusReason: r.statusReason,
        adminNote: r.adminNote,
        confirmedAt: r.confirmedAt,
        createdAt: r.createdAt,
        user: { id: r.userId, email: r.userEmail, displayName: r.userDisplayName },
      })
    },
  },

  // PATCH /api/admin-payments/:id/note — update admin note
  {
    path: '/admin-payments/:id/note',
    method: 'patch',
    handler: async (req) => {
      if (!isAdmin(req)) {
        return Response.json({ error: 'Forbidden' }, { status: 403 })
      }

      const id = req.routeParams?.id as string
      if (!id) return Response.json({ error: 'Missing id' }, { status: 400 })

      await addDataAndFileToRequest(req)
      const body = req.data as { adminNote?: string } | undefined
      if (!body || typeof body.adminNote !== 'string') {
        return Response.json({ error: 'adminNote is required' }, { status: 400 })
      }

      const db = getDb()
      const result = await db
        .update(payments)
        .set({ adminNote: body.adminNote })
        .where(eq(payments.id, id))
        .returning({ id: payments.id })

      if (result.length === 0) {
        return Response.json({ error: 'Not found' }, { status: 404 })
      }

      return Response.json({ success: true })
    },
  },

  // GET /api/admin-payments/export — CSV download
  {
    path: '/admin-payments/export',
    method: 'get',
    handler: async (req) => {
      if (!isAdmin(req)) {
        return Response.json({ error: 'Forbidden' }, { status: 403 })
      }

      const url = new URL(req.url!)
      const statusFilter = url.searchParams.get('status') ?? ''
      const chainFilter = url.searchParams.get('chain') ?? ''

      const db = getDb()

      let query = db
        .select({
          txHash: payments.txHash,
          chain: payments.chain,
          asset: payments.asset,
          amount: payments.amount,
          status: payments.status,
          walletAddress: payments.walletAddress,
          userEmail: users.email,
          confirmedAt: payments.confirmedAt,
          createdAt: payments.createdAt,
        })
        .from(payments)
        .leftJoin(users, eq(payments.userId, users.id))
        .orderBy(desc(payments.createdAt))
        .$dynamic()

      if (statusFilter) {
        query = query.where(eq(payments.status, statusFilter as 'confirmed' | 'pending' | 'failed'))
      }
      if (chainFilter) {
        query = query.where(eq(payments.chain, chainFilter))
      }

      const rows = await query

      const csvHeader =
        'Tx Hash,Chain,Asset,Amount,Status,Wallet,User Email,Confirmed At,Created At'
      const csvRows = rows.map((r) => {
        const confirmedAt = r.confirmedAt ? new Date(r.confirmedAt).toISOString() : ''
        const createdAt = r.createdAt ? new Date(r.createdAt).toISOString() : ''
        return `${r.txHash},${r.chain},${r.asset},${r.amount},${r.status},${r.walletAddress ?? ''},${r.userEmail ?? ''},${confirmedAt},${createdAt}`
      })
      const csv = [csvHeader, ...csvRows].join('\n')

      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="payments-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      })
    },
  },
]
