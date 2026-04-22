import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: [
        '/',
        '/research/*',
        '/analysis/*',
        '/education/*',
        '/articles/*',
        '/tag/*',
        '/feed/*',
      ],
      disallow: ['/dashboard/*', '/settings/*', '/admin/*', '/api/*'],
    },
    sitemap: `${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/sitemap.xml`,
  }
}
