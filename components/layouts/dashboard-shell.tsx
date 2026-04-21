'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TopAppBar } from '@/components/layouts/top-app-bar'
import { Sidebar } from '@/components/layouts/sidebar'
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
  const { isOpen: searchOpen, open: openSearch, close: closeSearch } = useSearchModal()

  return (
    <div className="bg-surface flex h-screen flex-col overflow-hidden">
      <TopAppBar user={user} navCategories={navCategories} onSearchClick={openSearch} />
      <div className="relative flex min-h-0 flex-1">
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((c) => !c)} />
        <main
          id="main-scroll"
          className={`bg-surface-container-lowest flex min-h-0 flex-1 flex-col overflow-y-auto ${LAYOUT.mainRadius}`}
        >
          <div className={`flex-1 ${LAYOUT.content.px} ${LAYOUT.content.pt} ${LAYOUT.content.pb}`}>
            {children}
          </div>
          <footer
            className={`from-primary to-primary-container text-on-primary-container bg-gradient-to-r ${LAYOUT.content.px} py-4 text-center text-xs`}
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
