import { GuestNav } from '@/components/layouts/guest-nav'
import { Footer } from '@/components/layouts/footer'
import { LAYOUT } from '@/lib/config/layout'
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
        <div className={LAYOUT.guest.container}>
          <GuestNav />
        </div>
      </div>

      <main className={cn('flex-1', className)}>{children}</main>

      <Footer />
    </div>
  )
}

/* ── GuestPage — constrained content page (terms, privacy, etc.) ─ */

interface GuestPageProps {
  children: React.ReactNode
  className?: string
}

/** Wraps children in `max-w-site` + standard vertical padding. */
export function GuestPage({ children, className }: GuestPageProps) {
  return (
    <GuestShell className={cn(LAYOUT.guest.container, 'w-full', LAYOUT.guest.pagePy, className)}>
      {children}
    </GuestShell>
  )
}

/* ── GuestSection — constrained section within a full-width guest page ─ */

interface GuestSectionProps {
  children: React.ReactNode
  className?: string
  as?: 'section' | 'div'
}

/** Applies `max-w-site mx-auto px-4 md:px-8` so sections don't repeat container classes. */
export function GuestSection({ children, className, as: Tag = 'section' }: GuestSectionProps) {
  return <Tag className={cn(LAYOUT.guest.container, className)}>{children}</Tag>
}
