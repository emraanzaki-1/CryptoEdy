'use client'

import { ErrorContent } from '@/components/common/error-content'

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ErrorContent
      code={500}
      title="INTERNAL SERVER ERROR"
      message="Something went wrong on our end. Our analysts are looking into it. We apologize for this interruption in your intelligence stream."
      backLabel="Back to Feed"
      backHref="/feed"
      onRetry={reset}
    />
  )
}
