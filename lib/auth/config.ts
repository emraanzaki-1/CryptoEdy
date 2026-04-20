import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { getDb } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

export const authConfig: NextAuthConfig = {
  // DrizzleAdapter called lazily — getDb() only runs on first request, not at build time
  get adapter() {
    return DrizzleAdapter(getDb())
  },
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const email = (credentials.email as string).toLowerCase()

        const [user] = await getDb().select().from(users).where(eq(users.email, email)).limit(1)

        if (!user || !user.passwordHash) return null

        // Block check — blocked users cannot sign in
        if (user.blocked) return null

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )
        if (!passwordMatch) return null

        return {
          id: user.id,
          name: user.displayName || user.username || user.email.split('@')[0],
          email: user.email,
          image: user.avatarUrl ?? null,
          role: user.role,
          username: user.username,
          emailVerified: user.emailVerified ? new Date() : null,
          isEmailVerified: user.emailVerified,
          blocked: user.blocked,
          subscriptionExpiry: user.subscriptionExpiry?.toISOString() ?? null,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      // Initial sign-in — populate token from user object
      if (user) {
        token.id = user.id
        token.name = (user as Record<string, unknown>).name as string
        token.picture = user.image ?? null
        token.role = (user as Record<string, unknown>).role as string
        token.username = (user as Record<string, unknown>).username as string | null
        token.isEmailVerified = !!(user as Record<string, unknown>).isEmailVerified
        token.blocked = !!(user as Record<string, unknown>).blocked
        token.subscriptionExpiry =
          ((user as Record<string, unknown>).subscriptionExpiry as string | null) ?? null
      }

      // Re-verify user against DB on explicit update, or every 5 minutes.
      // Catches deleted/blocked users without a DB hit on every request.
      const REVALIDATE_INTERVAL = 5 * 60 * 1000
      const lastVerified = (token.lastVerified as number) ?? 0
      const needsRevalidation =
        trigger === 'update' || Date.now() - lastVerified > REVALIDATE_INTERVAL

      if (!user && needsRevalidation) {
        const [freshUser] = await getDb()
          .select()
          .from(users)
          .where(eq(users.id, token.id as string))
          .limit(1)

        // User deleted or blocked — invalidate session
        if (!freshUser || freshUser.blocked) {
          return null
        }

        token.name = freshUser.displayName || freshUser.username || freshUser.email.split('@')[0]
        token.picture = freshUser.avatarUrl ?? null
        token.role = freshUser.role
        token.username = freshUser.username
        token.isEmailVerified = freshUser.emailVerified
        token.blocked = freshUser.blocked
        token.subscriptionExpiry = freshUser.subscriptionExpiry?.toISOString() ?? null
        token.lastVerified = Date.now()
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.name = token.name as string
        session.user.image = (token.picture as string) ?? null
        session.user.role = token.role as string
        session.user.username = (token.username as string) ?? null
        session.user.isEmailVerified = !!(token.isEmailVerified as boolean)
        session.user.blocked = !!(token.blocked as boolean)
        session.user.subscriptionExpiry = (token.subscriptionExpiry as string | null) ?? null
      }
      return session
    },
  },
}
