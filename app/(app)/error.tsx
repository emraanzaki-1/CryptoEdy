'use client'

import { GuestShell } from '@/components/layouts/guest-shell'
import { ErrorContent } from '@/components/common/error-content'

export default function AppError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <GuestShell>
      <ErrorContent
        code={500}
        title="INTERNAL SERVER ERROR"
        message="Something went wrong on our end. Our analysts are looking into it. We apologize for this interruption in your intelligence stream."
        backLabel="Back to Home"
        backHref="/"
        onRetry={reset}
      />
    </GuestShell>
  )
}
