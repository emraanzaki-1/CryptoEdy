import type { Endpoint } from 'payload'
import { addDataAndFileToRequest } from 'payload'
import { getDb } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq, ilike, or, count } from 'drizzle-orm'

const VALID_ROLES = ['free', 'pro', 'analyst', 'admin'] as const

function isAdmin(req: { user?: Record<string, unknown> | null }): boolean {
  return (req.user as { role?: string } | null)?.role === 'admin'
}

export const adminUserEndpoints: Endpoint[] = [
  // GET /api/admin-users — list app users (paginated, searchable)
  {
    path: '/admin-users',
    method: 'get',
    handler: async (req) => {
      if (!isAdmin(req)) {
        return Response.json({ error: 'Forbidden' }, { status: 403 })
      }

      const url = new URL(req.url!)
      const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1'))
      const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') ?? '20')))
      const search = url.searchParams.get('search') ?? ''
      const roleFilter = url.searchParams.get('role') ?? ''
      const offset = (page - 1) * limit

      const db = getDb()

      // Build query with optional filtering
      let query = db
        .select({
          id: users.id,
          email: users.email,
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
          role: users.role,
          subscriptionExpiry: users.subscriptionExpiry,
          emailVerified: users.emailVerified,
          blocked: users.blocked,
          createdAt: users.createdAt,
        })
        .from(users)
        .limit(limit)
        .offset(offset)
        .$dynamic()

      let countQuery = db.select({ total: count() }).from(users).$dynamic()

      if (
        search &&
        roleFilter &&
        VALID_ROLES.includes(roleFilter as (typeof VALID_ROLES)[number])
      ) {
        const searchCond = or(
          ilike(users.email, `%${search}%`),
          ilike(users.username, `%${search}%`),
          ilike(users.displayName, `%${search}%`)
        )!
        const roleCond = eq(users.role, roleFilter as (typeof VALID_ROLES)[number])
        query = query.where(searchCond).where(roleCond)
        countQuery = countQuery.where(searchCond).where(roleCond)
      } else if (search) {
        const searchCond = or(
          ilike(users.email, `%${search}%`),
          ilike(users.username, `%${search}%`),
          ilike(users.displayName, `%${search}%`)
        )!
        query = query.where(searchCond)
        countQuery = countQuery.where(searchCond)
      } else if (roleFilter && VALID_ROLES.includes(roleFilter as (typeof VALID_ROLES)[number])) {
        const roleCond = eq(users.role, roleFilter as (typeof VALID_ROLES)[number])
        query = query.where(roleCond)
        countQuery = countQuery.where(roleCond)
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

  // PATCH /api/admin-users/:id/role — change user role
  {
    path: '/admin-users/:id/role',
    method: 'patch',
    handler: async (req) => {
      if (!isAdmin(req)) {
        return Response.json({ error: 'Forbidden' }, { status: 403 })
      }

      await addDataAndFileToRequest(req)
      const { role } = (req.data ?? {}) as { role?: string }

      if (!role || !VALID_ROLES.includes(role as (typeof VALID_ROLES)[number])) {
        return Response.json(
          { error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}` },
          { status: 400 }
        )
      }

      const userId = req.routeParams?.id as string
      const db = getDb()

      // Prevent demoting the last admin
      if (role !== 'admin') {
        const [{ total }] = await db
          .select({ total: count() })
          .from(users)
          .where(eq(users.role, 'admin'))

        if (total <= 1) {
          // Check if the target user is currently admin
          const [target] = await db
            .select({ role: users.role })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1)

          if (target?.role === 'admin') {
            return Response.json({ error: 'Cannot demote the last admin' }, { status: 400 })
          }
        }
      }

      const [updated] = await db
        .update(users)
        .set({ role: role as (typeof VALID_ROLES)[number], updatedAt: new Date() })
        .where(eq(users.id, userId))
        .returning({ id: users.id, role: users.role })

      if (!updated) {
        return Response.json({ error: 'User not found' }, { status: 404 })
      }

      return Response.json({ success: true, user: updated })
    },
  },

  // PATCH /api/admin-users/:id/subscription — override subscription
  {
    path: '/admin-users/:id/subscription',
    method: 'patch',
    handler: async (req) => {
      if (!isAdmin(req)) {
        return Response.json({ error: 'Forbidden' }, { status: 403 })
      }

      await addDataAndFileToRequest(req)
      const { subscriptionExpiry } = (req.data ?? {}) as { subscriptionExpiry?: string }

      if (!subscriptionExpiry) {
        return Response.json(
          { error: 'subscriptionExpiry is required (ISO date string)' },
          { status: 400 }
        )
      }

      const expiry = new Date(subscriptionExpiry)
      if (isNaN(expiry.getTime())) {
        return Response.json({ error: 'Invalid date format' }, { status: 400 })
      }

      const userId = req.routeParams?.id as string
      const db = getDb()

      const [updated] = await db
        .update(users)
        .set({
          role: 'pro',
          subscriptionExpiry: expiry,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning({
          id: users.id,
          role: users.role,
          subscriptionExpiry: users.subscriptionExpiry,
        })

      if (!updated) {
        return Response.json({ error: 'User not found' }, { status: 404 })
      }

      return Response.json({ success: true, user: updated })
    },
  },

  // GET /api/admin-users/:id — fetch a single app user
  {
    path: '/admin-users/:id',
    method: 'get',
    handler: async (req) => {
      if (!isAdmin(req)) {
        return Response.json({ error: 'Forbidden' }, { status: 403 })
      }

      const userId = req.routeParams?.id as string
      const db = getDb()

      const [user] = await db
        .select({
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
          role: users.role,
          emailVerified: users.emailVerified,
          subscriptionExpiry: users.subscriptionExpiry,
          blocked: users.blocked,
          referralCode: users.referralCode,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1)

      if (!user) {
        return Response.json({ error: 'User not found' }, { status: 404 })
      }

      return Response.json({ user })
    },
  },

  // PATCH /api/admin-users/:id — update app user fields
  {
    path: '/admin-users/:id',
    method: 'patch',
    handler: async (req) => {
      if (!isAdmin(req)) {
        return Response.json({ error: 'Forbidden' }, { status: 403 })
      }

      await addDataAndFileToRequest(req)
      const data = (req.data ?? {}) as Record<string, unknown>
      const userId = req.routeParams?.id as string
      const db = getDb()

      // Build update object from allowed fields
      const allowedFields = [
        'firstName',
        'lastName',
        'username',
        'displayName',
        'role',
        'emailVerified',
        'subscriptionExpiry',
        'blocked',
      ] as const

      const updates: Record<string, unknown> = { updatedAt: new Date() }

      for (const field of allowedFields) {
        if (data[field] !== undefined) {
          if (field === 'role') {
            if (!VALID_ROLES.includes(data[field] as (typeof VALID_ROLES)[number])) {
              return Response.json(
                { error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}` },
                { status: 400 }
              )
            }
            // Prevent demoting the last admin
            if (data[field] !== 'admin') {
              const [{ total }] = await db
                .select({ total: count() })
                .from(users)
                .where(eq(users.role, 'admin'))
              if (total <= 1) {
                const [target] = await db
                  .select({ role: users.role })
                  .from(users)
                  .where(eq(users.id, userId))
                  .limit(1)
                if (target?.role === 'admin') {
                  return Response.json({ error: 'Cannot demote the last admin' }, { status: 400 })
                }
              }
            }
          }
          if (field === 'subscriptionExpiry' && data[field]) {
            const expiry = new Date(data[field] as string)
            if (isNaN(expiry.getTime())) {
              return Response.json(
                { error: 'Invalid date format for subscriptionExpiry' },
                { status: 400 }
              )
            }
            updates[field] = expiry
          } else {
            updates[field] = data[field]
          }
        }
      }

      const [updated] = await db.update(users).set(updates).where(eq(users.id, userId)).returning({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        username: users.username,
        displayName: users.displayName,
        role: users.role,
        emailVerified: users.emailVerified,
        subscriptionExpiry: users.subscriptionExpiry,
        blocked: users.blocked,
        updatedAt: users.updatedAt,
      })

      if (!updated) {
        return Response.json({ error: 'User not found' }, { status: 404 })
      }

      return Response.json({ success: true, user: updated })
    },
  },

  // PATCH /api/admin-users/:id/block — block or unblock a user
  {
    path: '/admin-users/:id/block',
    method: 'patch',
    handler: async (req) => {
      if (!isAdmin(req)) {
        return Response.json({ error: 'Forbidden' }, { status: 403 })
      }

      await addDataAndFileToRequest(req)
      const { blocked } = (req.data ?? {}) as { blocked?: boolean }

      if (typeof blocked !== 'boolean') {
        return Response.json({ error: 'blocked must be a boolean' }, { status: 400 })
      }

      const userId = req.routeParams?.id as string
      const db = getDb()

      // Prevent blocking the last admin
      if (blocked) {
        const [target] = await db
          .select({ role: users.role })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1)

        if (target?.role === 'admin') {
          const [{ total }] = await db
            .select({ total: count() })
            .from(users)
            .where(eq(users.role, 'admin'))
          if (total <= 1) {
            return Response.json({ error: 'Cannot block the last admin' }, { status: 400 })
          }
        }
      }

      const [updated] = await db
        .update(users)
        .set({ blocked, updatedAt: new Date() })
        .where(eq(users.id, userId))
        .returning({ id: users.id, blocked: users.blocked })

      if (!updated) {
        return Response.json({ error: 'User not found' }, { status: 404 })
      }

      return Response.json({ success: true, user: updated })
    },
  },

  // DELETE /api/admin-users/:id — permanently delete a user
  {
    path: '/admin-users/:id',
    method: 'delete',
    handler: async (req) => {
      if (!isAdmin(req)) {
        return Response.json({ error: 'Forbidden' }, { status: 403 })
      }

      const userId = req.routeParams?.id as string
      const db = getDb()

      // Prevent deleting the last admin
      const [target] = await db
        .select({ role: users.role })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1)

      if (!target) {
        return Response.json({ error: 'User not found' }, { status: 404 })
      }

      if (target.role === 'admin') {
        const [{ total }] = await db
          .select({ total: count() })
          .from(users)
          .where(eq(users.role, 'admin'))
        if (total <= 1) {
          return Response.json({ error: 'Cannot delete the last admin' }, { status: 400 })
        }
      }

      await db.delete(users).where(eq(users.id, userId))

      return Response.json({ success: true })
    },
  },
]
