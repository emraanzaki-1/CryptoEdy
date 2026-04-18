'use client'

import Link from 'next/link'
import { Logo } from '@/components/common/logo'

export function GuestNav() {
  return (
    <header className="bg-surface-container-highest/80 sticky top-4 z-50 mx-auto mb-6 flex max-w-[960px] items-center justify-between rounded-xl px-4 py-4 whitespace-nowrap shadow-[0_4px_32px_-4px_rgba(11,28,48,0.06)] backdrop-blur-md">
      <Link href="/">
        <Logo />
      </Link>

      <div className="hidden flex-1 justify-end gap-8 md:flex">
        <div className="flex items-center gap-9">
          <Link
            href="#"
            className="text-on-surface-variant hover:text-primary text-sm leading-normal font-medium transition-colors"
          >
            Research
          </Link>
          <Link
            href="#performance"
            className="text-on-surface-variant hover:text-primary text-sm leading-normal font-medium transition-colors"
          >
            Performance
          </Link>
          <Link
            href="#pricing"
            className="text-on-surface-variant hover:text-primary text-sm leading-normal font-medium transition-colors"
          >
            Pricing
          </Link>
        </div>
        <Link
          href="/register"
          className="from-primary to-primary-container text-on-primary flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b px-6 py-2 text-sm leading-normal font-bold tracking-[0.015em] shadow-[0_8px_24px_-8px_rgba(0,62,199,0.4)] transition-transform hover:-translate-y-0.5"
        >
          Join Pro
        </Link>
      </div>
    </header>
  )
}
