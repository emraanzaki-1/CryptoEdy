import type { Endpoint } from 'payload'
import { getDb } from '@/lib/db'
import { users } from '@/lib/db/schema/users'
import { payments } from '@/lib/db/schema/payments'
import { eq, count, sql, desc, gte, and, ilike, or } from 'drizzle-orm'

function isAdmin(req: { user?: Record<string, unknown> | null }): boolean {
  return (req.user as { role?: string } | null)?.role === 'admin'
}

export const adminSubscriptionEndpoints: Endpoint[] = [
  // GET /api/admin-subscriptions/overview — KPI summary
  {
    path: '/admin-subscriptions/overview',
    method: 'get',
    handler: async (req) => {
      if (!isAdmin(req)) {
        return Response.json({ error: 'Forbidden' }, { status: 403 })
      }

      const db = getDb()
      const now = new Date()
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      const [
        totalUsersResult,
        activeProResult,
        expiredProResult,
        expiringSoonResult,
        totalRevenueResult,
        recentRevenueResult,
        totalPaymentsResult,
      ] = await Promise.all([
        // Total users
        db.select({ total: count() }).from(users),
        // Active Pro (role=pro AND expiry > now)
        db
          .select({ total: count() })
          .from(users)
          .where(and(eq(users.role, 'pro'), gte(users.subscriptionExpiry, now))),
        // Expired (role=free AND has subscription_expiry in the past — were once Pro)
        db
          .select({ total: count() })
          .from(users)
          .where(
            and(
              eq(users.role, 'free'),
              sql`${users.subscriptionExpiry} IS NOT NULL AND ${users.subscriptionExpiry} < ${now}`
            )
          ),
        // Expiring within 30 days
        db
          .select({ total: count() })
          .from(users)
          .where(
            and(
              eq(users.role, 'pro'),
              gte(users.subscriptionExpiry, now),
              sql`${users.subscriptionExpiry} <= ${thirtyDaysFromNow}`
            )
          ),
        // Total confirmed revenue
        db
          .select({ total: sql<string>`COALESCE(SUM(${payments.amount}::numeric), 0)` })
          .from(payments)
          .where(eq(payments.status, 'confirmed')),
        // Last 30 days revenue
        db
          .select({ total: sql<string>`COALESCE(SUM(${payments.amount}::numeric), 0)` })
          .from(payments)
          .where(and(eq(payments.status, 'confirmed'), gte(payments.createdAt, thirtyDaysAgo))),
        // Total confirmed payments count
        db.select({ total: count() }).from(payments).where(eq(payments.status, 'confirmed')),
      ])

      return Response.json({
        totalUsers: totalUsersResult[0].total,
        activePro: activeProResult[0].total,
        expiredPro: expiredProResult[0].total,
        expiringSoon: expiringSoonResult[0].total,
        totalRevenue: parseFloat(totalRevenueResult[0].total),
        recentRevenue: parseFloat(recentRevenueResult[0].total),
        totalPayments: totalPaymentsResult[0].total,
      })
    },
  },

  // GET /api/admin-subscriptions — paginated subscriber list
  {
    path: '/admin-subscriptions',
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
      const now = new Date()

      // Only show users who have/had a subscription (subscriptionExpiry is not null)
      const baseCondition = sql`${users.subscriptionExpiry} IS NOT NULL`

      const conditions = [baseCondition]

      if (search) {
        conditions.push(
          or(
            ilike(users.email, `%${search}%`),
            ilike(users.displayName, `%${search}%`),
            ilike(users.username, `%${search}%`)
          )!
        )
      }

      if (statusFilter === 'active') {
        conditions.push(and(eq(users.role, 'pro'), gte(users.subscriptionExpiry, now))!)
      } else if (statusFilter === 'expired') {
        conditions.push(sql`${users.subscriptionExpiry} < ${now}`)
      } else if (statusFilter === 'expiring') {
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        conditions.push(
          and(
            eq(users.role, 'pro'),
            gte(users.subscriptionExpiry, now),
            sql`${users.subscriptionExpiry} <= ${thirtyDaysFromNow}`
          )!
        )
      }

      const whereClause = conditions.reduce((a, b) => sql`${a} AND ${b}`)

      const [rows, [{ total }]] = await Promise.all([
        db
          .select({
            id: users.id,
            email: users.email,
            displayName: users.displayName,
            username: users.username,
            role: users.role,
            subscriptionExpiry: users.subscriptionExpiry,
            createdAt: users.createdAt,
          })
          .from(users)
          .where(whereClause)
          .orderBy(desc(users.subscriptionExpiry))
          .limit(limit)
          .offset(offset),
        db.select({ total: count() }).from(users).where(whereClause),
      ])

      const docs = rows.map((r) => ({
        ...r,
        subscriptionStatus:
          r.role === 'pro' && r.subscriptionExpiry && r.subscriptionExpiry >= now
            ? 'active'
            : 'expired',
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
]
