'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronRight, ArrowLeft, FlaskConical, LineChart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ButtonLink } from '@/components/ui/button-link'
import { Logo } from '@/components/common/logo'
import { TAXONOMY } from '@/lib/constants/taxonomy'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { label: 'Research', href: '/#research' },
  { label: 'Performance', href: '/#performance' },
  { label: 'Pricing', href: '/#pricing' },
] as const

const CATEGORY_SECTIONS = [
  {
    key: 'research' as const,
    label: TAXONOMY.research.label,
    icon: FlaskConical,
    items: TAXONOMY.research.items,
  },
  {
    key: 'analysis' as const,
    label: TAXONOMY.analysis.label,
    icon: LineChart,
    items: TAXONOMY.analysis.items,
  },
] as const

export function GuestNav() {
  const [mobileOpen, setMobileOpen] = useState(false)

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

        {/* Mobile hamburger */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-on-surface-variant hover:text-on-surface md:hidden"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>

      {/* Full-screen mobile menu — portalled to body to escape overflow-x-clip */}
      {mobileOpen && createPortal(<GuestMobileMenu onClose={closeMobile} />, document.body)}
    </header>
  )
}

/* ── Full-screen mobile menu (slide drill-down, matches MobileNav) ── */

type SubMenu = { label: string; items: { label: string; href: string }[] }

function GuestMobileMenu({ onClose }: { onClose: () => void }) {
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
              {/* Category drilldowns */}
              {CATEGORY_SECTIONS.map((section) => (
                <button
                  key={section.key}
                  onClick={() =>
                    openSub({
                      label: section.label,
                      items: [
                        { label: `All ${section.label}`, href: `/${section.key}` },
                        ...section.items.map((i) => ({
                          label: i.label,
                          href: `/${section.key}/${i.slug}`,
                        })),
                      ],
                    })
                  }
                  className={drillClass}
                >
                  <section.icon className="size-5 shrink-0" />
                  <span className="flex-1 text-left">{section.label}</span>
                  <ChevronRight className="text-on-surface-variant size-5 shrink-0" />
                </button>
              ))}

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
