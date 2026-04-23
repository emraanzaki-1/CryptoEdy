import type { MetadataRoute } from 'next'

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      // Default is allow-all — only list explicit disallows
      disallow: ['/feed/', '/dashboard/', '/settings/', '/admin/', '/api/'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
