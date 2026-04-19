import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      username: string | null
      isEmailVerified: boolean
      blocked: boolean
      subscriptionExpiry: string | null
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    username: string | null
    isEmailVerified: boolean
    blocked: boolean
    subscriptionExpiry: string | null
  }
}
