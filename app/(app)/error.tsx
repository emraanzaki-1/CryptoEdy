'use client'

import { GuestNav } from '@/components/layouts/guest-nav'
import { Footer } from '@/components/layouts/footer'
import { ErrorContent } from '@/components/common/error-content'

export default function AppError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="bg-surface relative flex min-h-screen w-full flex-col overflow-x-clip">
      <div className="bg-surface-container-highest/80 sticky top-0 z-50 w-full backdrop-blur-md">
        <div className="mx-auto max-w-[1200px] px-4 md:px-8">
          <GuestNav />
        </div>
      </div>

      <ErrorContent
        code={500}
        title="INTERNAL SERVER ERROR"
        message="Something went wrong on our end. Our analysts are looking into it. We apologize for this interruption in your intelligence stream."
        backLabel="Back to Home"
        backHref="/"
        onRetry={reset}
      />

      <Footer />
    </div>
  )
}
