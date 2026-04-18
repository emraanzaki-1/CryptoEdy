'use client'

import { useState } from 'react'
import { PanelLeft, PanelLeftClose } from 'lucide-react'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { TopAppBar } from '@/components/layouts/top-app-bar'
import { Sidebar } from '@/components/layouts/sidebar'

interface DashboardShellProps {
  user: {
    name: string
    image?: string
    isPro: boolean
  }
  children: React.ReactNode
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)

  return (
    <ThemeProvider>
      <div className="bg-surface flex h-screen flex-col overflow-hidden">
        <TopAppBar user={user} />
        <div className="relative flex min-h-0 flex-1">
          <Sidebar collapsed={sidebarCollapsed} />
          <main className="bg-surface-container-lowest flex min-h-0 flex-1 flex-col overflow-y-auto rounded-tl-3xl">
            <div className="flex-1 p-6 lg:p-10">
              <button
                onClick={() => setSidebarCollapsed((c) => !c)}
                className="text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface mb-4 flex size-8 items-center justify-center rounded-lg transition-colors"
                aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {sidebarCollapsed ? (
                  <PanelLeft className="size-4" />
                ) : (
                  <PanelLeftClose className="size-4" />
                )}
              </button>
              {children}
            </div>
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
      </div>
    </ThemeProvider>
  )
}
