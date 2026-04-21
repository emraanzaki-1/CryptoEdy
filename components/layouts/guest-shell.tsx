import { GuestNav } from '@/components/layouts/guest-nav'
import { Footer } from '@/components/layouts/footer'
import { cn } from '@/lib/utils'

interface GuestShellProps {
  children: React.ReactNode
  /** Additional className on the <main> element */
  className?: string
}

export function GuestShell({ children, className }: GuestShellProps) {
  return (
    <div className="bg-surface relative flex min-h-screen w-full flex-col overflow-x-clip">
      <div className="bg-surface-container-highest/80 sticky top-0 z-50 w-full backdrop-blur-md">
        <div className="max-w-site mx-auto px-4 md:px-8">
          <GuestNav />
        </div>
      </div>

      <main className={cn('flex-1', className)}>{children}</main>

      <Footer />
    </div>
  )
}
