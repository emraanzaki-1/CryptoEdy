'use client'

import { useState } from 'react'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { TopAppBar } from '@/components/layouts/top-app-bar'
import { Sidebar } from '@/components/layouts/sidebar'
import { SearchModal } from '@/components/common/search-modal'
import { useSearchModal } from '@/lib/hooks/useSearchModal'

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
    <ThemeProvider>
      <div className="bg-surface flex h-screen flex-col overflow-hidden">
        <TopAppBar user={user} navCategories={navCategories} onSearchClick={openSearch} />
        <div className="relative flex min-h-0 flex-1">
          <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((c) => !c)} />
          <main className="bg-surface-container-lowest flex min-h-0 flex-1 flex-col overflow-y-auto rounded-tl-3xl">
            <div className="flex-1 px-6 pt-6 pb-6 lg:px-10 lg:pt-8 lg:pb-10">{children}</div>
            <footer className="from-primary to-primary-container text-on-primary-container bg-gradient-to-r px-6 py-4 text-center text-xs lg:px-10">
              &copy; {new Date().getFullYear()} CryptoEdy Research &middot;{' '}
              <a href="#" className="text-on-primary-container hover:text-on-primary">
                Help
              </a>{' '}
              &middot;{' '}
              <a href="#" className="text-on-primary-container hover:text-on-primary">
                Terms
              </a>{' '}
              &middot;{' '}
              <a href="#" className="text-on-primary-container hover:text-on-primary">
                Privacy
              </a>
            </footer>
          </main>
        </div>
        <SearchModal isOpen={searchOpen} onClose={closeSearch} />
      </div>
    </ThemeProvider>
  )
}
