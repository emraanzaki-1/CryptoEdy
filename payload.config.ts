import { buildConfig } from 'payload'
import type { Endpoint } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { addDataAndFileToRequest } from 'payload'
import { revalidateTag } from 'next/cache'
import path from 'path'
import { fileURLToPath } from 'url'

import { Authors } from './collections/Authors'
import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Posts } from './collections/Posts'
import { Tags } from './collections/Tags'
import { Bookmarks } from './collections/Bookmarks'
import { richTextEditor } from './lib/lexical/richEditor'
import { getDb } from './lib/db'
import { users } from './lib/db/schema'
import { eq, ilike, or, count } from 'drizzle-orm'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// ── Admin endpoints: manage app users from Payload admin ─────────────────────

const VALID_ROLES = ['free', 'pro', 'analyst', 'admin'] as const

function isAdmin(req: { user?: Record<string, unknown> | null }): boolean {
  return (req.user as { role?: string } | null)?.role === 'admin'
}

const adminUserEndpoints: Endpoint[] = [
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

// ── Category reorder endpoint ────────────────────────────────────────────────

const categoryReorderEndpoint: Endpoint = {
  path: '/categories-reorder',
  method: 'post',
  handler: async (req) => {
    if (!isAdmin(req)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    await addDataAndFileToRequest(req)
    const { items } = (req.data ?? {}) as {
      items?: Array<{ id: string | number; weight: number }>
    }

    if (!Array.isArray(items) || items.length === 0) {
      return Response.json({ error: 'items array is required: [{ id, weight }]' }, { status: 400 })
    }

    // Validate all weights are non-negative integers
    for (const item of items) {
      if (typeof item.weight !== 'number' || item.weight < 0 || !Number.isInteger(item.weight)) {
        return Response.json(
          { error: `Invalid weight for id ${item.id}: must be a non-negative integer` },
          { status: 400 }
        )
      }
    }

    await Promise.all(
      items.map((item) =>
        req.payload.update({
          collection: 'categories',
          id: item.id,
          data: { weight: item.weight },
        })
      )
    )

    revalidateTag('categories')

    return Response.json({ success: true })
  },
}

export default buildConfig({
  admin: {
    // Authors collection has auth: true — these are the CMS editor accounts
    user: 'authors',
    // 'all' lets each editor pick Light / Dark via avatar → Account → Theme.
    theme: 'all',
    // Live preview breakpoints shown in the admin iframe toolbar
    livePreview: {
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 375, height: 667 },
        { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
    components: {
      graphics: {
        Logo: '@/components/admin/Logo',
        Icon: '@/components/admin/Icon',
      },
      beforeDashboard: ['@/components/admin/AdminDashboard'],
      afterNavLinks: ['@/components/admin/AdminNavLinks'],
      views: {
        userManagement: {
          Component: '@/components/admin/views/UserManagement',
          path: '/user-management',
          meta: {
            title: 'App Users',
            description: 'Manage application user roles and subscriptions',
          },
        },
        userManagementEdit: {
          Component: '@/components/admin/views/UserManagementEdit',
          path: '/user-management/:id',
          meta: {
            title: 'Edit App User',
            description: 'Edit application user details',
          },
        },
      },
    },
  },
  endpoints: [...adminUserEndpoints, categoryReorderEndpoint],
  collections: [Authors, Categories, Tags, Media, Posts, Bookmarks],
  // Rich Lexical editor is the global default for all richText fields.
  // Posts.content overrides with the same editor (with custom crypto blocks).
  editor: richTextEditor,
  secret: process.env.PAYLOAD_SECRET ?? '',
  typescript: {
    outputFile: path.resolve(dirname, 'types/payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
    // Use a dedicated 'payload' schema so CMS tables are isolated from
    // the NextAuth/Drizzle tables that live in the default 'public' schema.
    schemaName: 'payload',
  }),
  plugins: [
    seoPlugin({
      collections: ['posts'],
      uploadsCollection: 'media',
      // Auto-populate SEO fields from post data
      generateTitle: ({ doc }) => (doc?.title ? `${doc.title as string} | CryptoEdy` : 'CryptoEdy'),
      generateDescription: ({ doc }) => (doc?.excerpt as string) ?? '',
      generateURL: ({ doc }) => {
        const base = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
        return `${base}/posts/${(doc?.slug as string) ?? ''}`
      },
    }),
  ],
})
