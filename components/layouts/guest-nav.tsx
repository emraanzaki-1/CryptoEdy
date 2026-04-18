'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Logo } from '@/components/common/logo'

const NAV_LINKS = [
  { label: 'Research', href: '#research' },
  { label: 'Performance', href: '#performance' },
  { label: 'Pricing', href: '#pricing' },
] as const

export function GuestNav() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="bg-surface-container-highest/80 sticky top-4 z-50 mx-auto mb-6 flex max-w-[960px] flex-col rounded-xl shadow-[0_4px_32px_-4px_rgba(11,28,48,0.06)] backdrop-blur-md">
      <div className="flex items-center justify-between px-4 py-4 whitespace-nowrap">
        <Link href="/">
          <Logo />
        </Link>

        {/* Desktop nav */}
        <div className="hidden flex-1 justify-end gap-8 md:flex">
          <div className="flex items-center gap-9">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-on-surface-variant hover:text-primary text-sm leading-normal font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-on-surface-variant hover:text-on-surface text-sm font-medium transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="from-primary to-primary-container text-on-primary flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b px-6 py-2 text-sm leading-normal font-bold tracking-[0.015em] shadow-[0_8px_24px_-8px_rgba(0,62,199,0.4)] transition-transform hover:-translate-y-0.5"
            >
              Join Pro
            </Link>
          </div>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-on-surface-variant hover:text-on-surface flex size-10 items-center justify-center rounded-lg transition-colors md:hidden"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-outline-variant/15 flex flex-col gap-1 border-t px-4 pt-2 pb-4 md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="border-outline-variant/15 mt-2 flex flex-col gap-2 border-t pt-3">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="text-on-surface-variant hover:text-on-surface px-3 py-2.5 text-center text-sm font-medium transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileOpen(false)}
              className="from-primary to-primary-container text-on-primary flex items-center justify-center rounded-xl bg-gradient-to-b px-6 py-3 text-sm font-bold tracking-[0.015em]"
            >
              Join Pro
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
