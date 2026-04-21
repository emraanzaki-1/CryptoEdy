import { GuestShell } from '@/components/layouts/guest-shell'
import { ErrorContent } from '@/components/common/error-content'

export default function NotFound() {
  return (
    <GuestShell>
      <ErrorContent
        code={404}
        title="PAGE NOT FOUND"
        message="The page you're looking for doesn't exist or has been moved. Let's get you back on track."
        backLabel="Back to Home"
        backHref="/"
      />
    </GuestShell>
  )
}
