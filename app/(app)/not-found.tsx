import { GuestShell } from '@/components/layouts/guest-shell'
import { getNavCategories } from '@/lib/categories/getCategories'
import { ErrorContent } from '@/components/common/error-content'

export default async function NotFound() {
  const navCategories = await getNavCategories()

  return (
    <GuestShell navCategories={navCategories}>
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
