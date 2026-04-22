'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { TopAppBar } from '@/components/layouts/top-app-bar'
import { Sidebar } from '@/components/layouts/sidebar'
import { MobileNav } from '@/components/layouts/mobile-nav'
import { SearchModal } from '@/components/common/search-modal'
import { useSearchModal } from '@/lib/hooks/useSearchModal'
import { LAYOUT } from '@/lib/config/layout'

import type { NavCategory } from '@/lib/categories/getCategories'

interface DashboardShellProps {
  user: {
    name: string
    email?: string
    image?: string
    isPro: boolean
  }
  navCategories: NavCategory[]
  children: React.ReactNode
}

export function DashboardShell({ user, navCategories, children }: DashboardShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isOpen: searchOpen, open: openSearch, close: closeSearch } = useSearchModal()
  const closeMobile = useCallback(() => setMobileOpen(false), [])

  return (
    <div className="bg-surface flex h-dvh flex-col overflow-hidden">
      <TopAppBar
        user={user}
        navCategories={navCategories}
        onSearchClick={openSearch}
        onMenuClick={() => setMobileOpen((v) => !v)}
      />
      <div className="relative flex min-h-0 flex-1">
        {/* Desktop sidebar */}
        <div className="hidden lg:flex">
          <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((c) => !c)} />
        </div>

        {/* Mobile full-screen nav */}
        <MobileNav open={mobileOpen} onClose={closeMobile} navCategories={navCategories} />

        <main
          id="main-content"
          className={`bg-surface-container-lowest flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain ${LAYOUT.mainRadius}`}
        >
          <div className={`flex-1 ${LAYOUT.content.px} ${LAYOUT.content.pt} ${LAYOUT.content.pb}`}>
            {children}
          </div>
          <footer
            className={`from-primary to-primary-container text-on-primary-container bg-gradient-to-r ${LAYOUT.content.px} text-micro py-4 text-center`}
          >
            &copy; {new Date().getFullYear()} CryptoEdy Research &middot;{' '}
            <Link href="/contact" className="text-on-primary-container hover:text-on-primary">
              Help
            </Link>{' '}
            &middot;{' '}
            <Link href="/terms" className="text-on-primary-container hover:text-on-primary">
              Terms
            </Link>{' '}
            &middot;{' '}
            <Link href="/privacy" className="text-on-primary-container hover:text-on-primary">
              Privacy
            </Link>
          </footer>
        </main>
      </div>
      <SearchModal isOpen={searchOpen} onClose={closeSearch} />
    </div>
  )
}
