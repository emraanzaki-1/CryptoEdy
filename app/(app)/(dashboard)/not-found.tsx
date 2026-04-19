import { ErrorContent } from '@/components/common/error-content'

export default function DashboardNotFound() {
  return (
    <ErrorContent
      code={404}
      title="PAGE NOT FOUND"
      message="The page you're looking for doesn't exist or has been moved. Let's get you back to your feed."
      backLabel="Back to Feed"
      backHref="/feed"
    />
  )
}
