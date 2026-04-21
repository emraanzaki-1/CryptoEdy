'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Users,
  Wrench,
  Settings,
  ChevronDown,
  BarChart2,
  TrendingUp,
  Layers,
  Gift,
  PanelLeft,
  PanelLeftClose,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NavCategory } from '@/lib/categories/getCategories'

const TOOLS_ITEMS = [
  { href: '/tools/market-direction', label: 'Market Direction', icon: BarChart2 },
  { href: '/tools/picks', label: 'Assets & Picks', icon: TrendingUp },
  { href: '/tools/tracker', label: 'Portfolio Tracker', icon: Layers },
  { href: '/tools/airdrops', label: 'Airdrops', icon: Gift },
]

const TOP_NAV = [
  { href: '/feed', label: 'Home', icon: Home },
  { href: '/community', label: 'Community', icon: Users },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  /** When true, sidebar is rendered inside the mobile drawer overlay */
  mobile?: boolean
  /** Category nav items to show in mobile drawer */
  navCategories?: NavCategory[]
}

/* ─── Hover slide-out panel for collapsed Tools ─────────────────────────── */
function ToolsSlideOut({ visible }: { visible: boolean }) {
  return (
    <div
      className={cn(
        'border-outline-variant/15 bg-surface-container-lowest absolute top-0 left-full z-[100] ml-1 min-w-[180px] overflow-hidden rounded-xl border shadow-lg transition-all duration-150',
        visible
          ? 'pointer-events-auto translate-x-0 opacity-100'
          : 'pointer-events-none -translate-x-1 opacity-0'
      )}
    >
      <p className="border-outline-variant/10 text-on-surface-variant text-overline border-b px-4 py-2.5 font-bold uppercase">
        Tools
      </p>
      {TOOLS_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface text-body-sm flex items-center gap-3 px-4 py-2.5 transition-colors"
        >
          <item.icon className="size-4 shrink-0" />
          {item.label}
        </Link>
      ))}
    </div>
  )
}

export function Sidebar({ collapsed, onToggle, mobile, navCategories }: SidebarProps) {
  const pathname = usePathname()
  const [toolsOpen, setToolsOpen] = useState(false)
  const [toolsHover, setToolsHover] = useState(false)
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isToolsActive = pathname.startsWith('/tools')

  function handleToolsMouseEnter() {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current)
    setToolsHover(true)
  }

  function handleToolsMouseLeave() {
    hoverTimeout.current = setTimeout(() => setToolsHover(false), 150)
  }

  return (
    <nav
      className={cn(
        'bg-surface flex flex-shrink-0 flex-col transition-all duration-300',
        collapsed ? 'w-20 overflow-visible' : 'w-64 overflow-y-auto'
      )}
    >
      <div className="flex flex-col gap-1 p-4 pt-4">
        {/* Collapse / expand toggle */}
        <button
          onClick={onToggle}
          className={cn(
            'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface mb-2 flex size-8 items-center justify-center rounded-lg transition-colors',
            collapsed ? 'self-center' : 'self-end'
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeft className="size-4" /> : <PanelLeftClose className="size-4" />}
        </button>

        {/* Regular nav items */}
        {TOP_NAV.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              onClick={mobile ? onToggle : undefined}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-3 transition-colors',
                isActive
                  ? 'bg-surface-container-lowest text-primary ring-outline-variant/15 shadow-sm ring-1'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              )}
            >
              <item.icon className="size-5 shrink-0" />
              {!collapsed && (
                <span className="text-body-sm font-medium whitespace-nowrap">{item.label}</span>
              )}
            </Link>
          )
        })}

        {/* Category nav — mobile only */}
        {mobile && navCategories && navCategories.length > 0 && (
          <>
            <div className="border-outline-variant/15 my-2 border-t" />
            {navCategories.map((cat) => (
              <div key={cat.label}>
                <p className="text-on-surface-variant text-overline mt-2 mb-1 px-3 font-bold uppercase">
                  {cat.label}
                </p>
                {cat.items.map((item) => {
                  const isActive = pathname.startsWith(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onToggle}
                      className={cn(
                        'text-body-sm flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors',
                        isActive
                          ? 'text-primary font-medium'
                          : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                      )}
                    >
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            ))}
          </>
        )}

        {/* Tools — expandable (expanded) or hover slide-out (collapsed) */}
        {collapsed ? (
          <div
            className="relative"
            onMouseEnter={handleToolsMouseEnter}
            onMouseLeave={handleToolsMouseLeave}
          >
            <button
              title="Tools"
              onClick={() => setToolsHover((v) => !v)}
              className={cn(
                'flex w-full items-center justify-center rounded-lg px-3 py-3 transition-colors',
                isToolsActive
                  ? 'bg-surface-container-lowest text-primary ring-outline-variant/15 shadow-sm ring-1'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              )}
            >
              <Wrench className="size-5 shrink-0" />
            </button>
            <ToolsSlideOut visible={toolsHover} />
          </div>
        ) : (
          <div>
            <button
              onClick={() => setToolsOpen((v) => !v)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-3 transition-colors',
                isToolsActive
                  ? 'bg-surface-container-lowest text-primary ring-outline-variant/15 shadow-sm ring-1'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              )}
            >
              <Wrench className="size-5 shrink-0" />
              <span className="text-body-sm flex-1 text-left font-medium whitespace-nowrap">
                Tools
              </span>
              <ChevronDown
                className={cn('size-4 shrink-0 transition-transform', toolsOpen && 'rotate-180')}
              />
            </button>

            {/* Inline children */}
            {toolsOpen && (
              <div className="mt-1 flex flex-col gap-0.5 pl-4">
                {TOOLS_ITEMS.map((item) => {
                  const isActive = pathname.startsWith(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={mobile ? onToggle : undefined}
                      className={cn(
                        'text-body-sm flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors',
                        isActive
                          ? 'text-primary font-medium'
                          : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                      )}
                    >
                      <item.icon className="size-4 shrink-0" />
                      <span className="whitespace-nowrap">{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Settings at bottom */}
      <div className="mt-auto p-4">
        <Link
          href="/settings/profile"
          title={collapsed ? 'Settings' : undefined}
          onClick={mobile ? onToggle : undefined}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-3 transition-colors',
            pathname.startsWith('/settings')
              ? 'bg-surface-container-lowest text-primary ring-outline-variant/15 shadow-sm ring-1'
              : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
          )}
        >
          <Settings className="size-5 shrink-0" />
          {!collapsed && (
            <span className="text-body-sm font-medium whitespace-nowrap">Settings</span>
          )}
        </Link>
      </div>
    </nav>
  )
}
