'use client'

import { Inter } from 'next/font/google'
import { ErrorContent } from '@/components/common/error-content'

const inter = Inter({ variable: '--font-inter', subsets: ['latin'] })

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="bg-surface text-on-surface font-body flex min-h-full flex-col">
        <ErrorContent
          code={500}
          title="CRITICAL ERROR"
          message="Something went seriously wrong. Our team has been notified and is working on a fix."
          backLabel="Back to Home"
          backHref="/"
          onRetry={reset}
        />
      </body>
    </html>
  )
}
