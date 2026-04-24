'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Menu,
  X,
  ChevronRight,
  ArrowLeft,
  FlaskConical,
  LineChart,
  BookOpen,
  GraduationCap,
  Sun,
  Moon,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { ButtonLink } from '@/components/ui/button-link'
import { Logo } from '@/components/common/logo'
import type { NavCategory } from '@/lib/categories/getCategories'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { label: 'Research', href: '/#research' },
  { label: 'Performance', href: '/#performance' },
  { label: 'Pricing', href: '/#pricing' },
] as const

/** Icon map keyed by routePrefix — add new entries when new hub sections are created */
const SECTION_ICONS: Record<string, LucideIcon> = {
  research: FlaskConical,
  analysis: LineChart,
}

type CategorySection = {
  key: string
  label: string
  icon: LucideIcon
  items: NavCategory['items']
}

interface GuestNavProps {
  navCategories: NavCategory[]
}

export function GuestNav({ navCategories }: GuestNavProps) {
  // Only show parent categories that have a routePrefix (hub-page-based sections)
  const categorySections: CategorySection[] = navCategories
    .filter((c) => c.routePrefix)
    .map((c) => ({
      key: c.routePrefix!,
      label: c.label,
      icon: SECTION_ICONS[c.routePrefix!] ?? BookOpen,
      items: c.items,
    }))

  const [mobileOpen, setMobileOpen] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()

  function toggleTheme() {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  function closeMobile() {
    setMobileOpen(false)
  }

  return (
    <header className="relative z-50 flex flex-col">
      <div className="flex items-center justify-between py-4 whitespace-nowrap">
        <Link href="/">
          <Logo />
        </Link>

        {/* Desktop nav */}
        <div className="hidden flex-1 justify-end gap-8 md:flex">
          <div className="flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-on-surface-variant hover:text-primary text-body-sm font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-on-surface-variant hover:text-on-surface"
              aria-label="Toggle theme"
            >
              <Sun className="size-4 scale-100 rotate-0 transition-transform dark:scale-0 dark:-rotate-90" />
              <Moon className="absolute size-4 scale-0 rotate-90 transition-transform dark:scale-100 dark:rotate-0" />
            </Button>
            <Link
              href="/login"
              className="text-on-surface-variant hover:text-on-surface text-body-sm font-medium transition-colors"
            >
              Sign In
            </Link>
            <ButtonLink href="/register" variant="gradient" size="default" className="min-w-[84px]">
              Join Now
            </ButtonLink>
          </div>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-1 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-on-surface-variant hover:text-on-surface"
            aria-label="Toggle theme"
          >
            <Sun className="size-4 scale-100 rotate-0 transition-transform dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute size-4 scale-0 rotate-90 transition-transform dark:scale-100 dark:rotate-0" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-on-surface-variant hover:text-on-surface"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {/* Full-screen mobile menu — portalled to body to escape overflow-x-clip */}
      {mobileOpen &&
        createPortal(
          <GuestMobileMenu onClose={closeMobile} categorySections={categorySections} />,
          document.body
        )}
    </header>
  )
}

/* ── Full-screen mobile menu (slide drill-down, matches MobileNav) ── */

type SubMenu = { label: string; items: { label: string; href: string }[] }

function GuestMobileMenu({
  onClose,
  categorySections,
}: {
  onClose: () => void
  categorySections: CategorySection[]
}) {
  const pathname = usePathname()
  const [subMenu, setSubMenu] = useState<SubMenu | null>(null)

  function handleLinkClick() {
    setSubMenu(null)
    onClose()
  }

  function openSub(menu: SubMenu) {
    setSubMenu(menu)
  }

  function closeSub() {
    setSubMenu(null)
  }

  /** Hash links need full path so they work from any page */
  const resolvedHref = (href: string) => {
    if (href.startsWith('/#') && pathname === '/') return href.replace('/', '')
    return href
  }

  const linkClass =
    'flex items-center gap-4 rounded-2xl px-4 py-3.5 text-body-sm font-medium text-on-surface hover:bg-surface-container-high transition-colors'

  const drillClass =
    'flex w-full items-center gap-4 rounded-2xl px-4 py-3.5 text-body-sm font-medium text-on-surface hover:bg-surface-container-high transition-colors'

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div className="bg-on-surface/40 absolute inset-0" onClick={handleLinkClick} />

      {/* Panel — full width, full viewport height */}
      <div className="bg-surface relative z-10 flex h-dvh w-full flex-col overflow-hidden">
        {/* Header */}
        <div className="border-outline-variant/15 flex items-center justify-between border-b px-5 py-4">
          {subMenu ? (
            <button
              onClick={closeSub}
              className="text-on-surface hover:bg-surface-container-high text-body-sm flex items-center gap-2 rounded-xl px-2 py-1.5 font-semibold transition-colors"
            >
              <ArrowLeft className="size-5" />
              {subMenu.label}
            </button>
          ) : (
            <Link href="/" onClick={handleLinkClick}>
              <Logo />
            </Link>
          )}
          <button
            onClick={handleLinkClick}
            className="text-on-surface-variant hover:bg-surface-container-high flex size-10 items-center justify-center rounded-full transition-colors"
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content area with slide transition */}
        <div className="relative min-h-0 flex-1 overflow-hidden">
          {/* Main menu */}
          <div
            className={cn(
              'absolute inset-0 overflow-y-auto overscroll-contain p-4 transition-transform duration-200',
              subMenu ? '-translate-x-full' : 'translate-x-0'
            )}
          >
            <div className="flex flex-col gap-1">
              {/* Category drilldowns — built from live Payload data */}
              {categorySections.map((section) => (
                <button
                  key={section.key}
                  onClick={() =>
                    openSub({
                      label: section.label,
                      // items already include the "All X" entry from getNavCategories
                      items: section.items.map((i) => ({ label: i.label, href: i.href })),
                    })
                  }
                  className={drillClass}
                >
                  <section.icon className="size-5 shrink-0" />
                  <span className="flex-1 text-left">{section.label}</span>
                  <ChevronRight className="text-on-surface-variant size-5 shrink-0" />
                </button>
              ))}

              {/* Static Education links */}
              <Link href="/crypto-school" onClick={handleLinkClick} className={linkClass}>
                <GraduationCap className="size-5 shrink-0" />
                <span className="flex-1 text-left">Crypto School</span>
              </Link>
              <Link href="/courses" onClick={handleLinkClick} className={linkClass}>
                <BookOpen className="size-5 shrink-0" />
                <span className="flex-1 text-left">Trading Courses</span>
              </Link>

              {/* Divider */}
              <div className="border-outline-variant/15 my-2 border-t" />

              {/* Primary navigation (hash links) */}
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={resolvedHref(link.href)}
                  onClick={handleLinkClick}
                  className={linkClass}
                >
                  {link.label}
                </Link>
              ))}

              {/* Auth buttons */}
              <div className="border-outline-variant/15 mt-4 flex gap-3 border-t pt-4">
                <ButtonLink
                  href="/register"
                  variant="gradient"
                  size="lg"
                  onClick={handleLinkClick}
                  className="flex-1"
                >
                  Get started
                </ButtonLink>
                <ButtonLink
                  href="/login"
                  variant="outline"
                  size="lg"
                  onClick={handleLinkClick}
                  className="flex-1"
                >
                  Log in
                </ButtonLink>
              </div>
            </div>
          </div>

          {/* Sub-menu panel */}
          <div
            className={cn(
              'absolute inset-0 overflow-y-auto overscroll-contain p-4 transition-transform duration-200',
              subMenu ? 'translate-x-0' : 'translate-x-full'
            )}
          >
            {subMenu && (
              <div className="flex flex-col gap-1">
                {subMenu.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleLinkClick}
                    className={linkClass}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
