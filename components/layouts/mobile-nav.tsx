'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Users,
  Wrench,
  Settings,
  ChevronRight,
  ArrowLeft,
  BarChart2,
  TrendingUp,
  Layers,
  Gift,
  User,
  CreditCard,
  Receipt,
  Bell,
  Palette,
  X,
  FlaskConical,
  LineChart,
  GraduationCap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NavCategory } from '@/lib/categories/getCategories'

const TOOLS_ITEMS = [
  { href: '/tools/market-direction', label: 'Market Direction', icon: BarChart2 },
  { href: '/tools/picks', label: 'Assets & Picks', icon: TrendingUp },
  { href: '/tools/tracker', label: 'Portfolio Tracker', icon: Layers },
  { href: '/tools/airdrops', label: 'Airdrops', icon: Gift },
]

const SETTINGS_ITEMS = [
  { href: '/settings/profile', label: 'Profile', icon: User },
  { href: '/settings/plans', label: 'Plans & Subscription', icon: CreditCard },
  { href: '/settings/billing', label: 'Billing', icon: Receipt },
  { href: '/settings/notifications', label: 'Notifications', icon: Bell },
  { href: '/settings/appearance', label: 'Appearance', icon: Palette },
]

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Research: FlaskConical,
  Analysis: LineChart,
  Education: GraduationCap,
}

type SubMenu = { label: string; items: { label: string; href: string }[] }

interface MobileNavProps {
  open: boolean
  onClose: () => void
  navCategories: NavCategory[]
}

export function MobileNav({ open, onClose, navCategories }: MobileNavProps) {
  const pathname = usePathname()
  const [subMenu, setSubMenu] = useState<SubMenu | null>(null)

  if (!open) return null

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

  const linkClass = (href: string, exact = false) =>
    cn(
      'flex items-center gap-4 rounded-2xl px-4 py-3.5 text-body-sm font-medium transition-colors',
      (exact ? pathname === href : pathname.startsWith(href))
        ? 'bg-primary-container/10 text-primary font-semibold'
        : 'text-on-surface hover:bg-surface-container-high'
    )

  const drillClass =
    'flex w-full items-center gap-4 rounded-2xl px-4 py-3.5 text-body-sm font-medium text-on-surface hover:bg-surface-container-high transition-colors'

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div className="bg-on-surface/40 absolute inset-0" onClick={handleLinkClick} />

      {/* Panel — full width */}
      <div className="bg-surface relative z-10 flex h-full w-full flex-col overflow-hidden">
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
            <span className="text-on-surface text-body-sm font-bold">Menu</span>
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
        <div className="relative flex-1 overflow-hidden">
          {/* Main menu */}
          <div
            className={cn(
              'absolute inset-0 overflow-y-auto overscroll-contain p-4 transition-transform duration-200',
              subMenu ? '-translate-x-full' : 'translate-x-0'
            )}
          >
            <div className="flex flex-col gap-1">
              {/* Direct links */}
              <Link href="/feed" onClick={handleLinkClick} className={linkClass('/feed', true)}>
                <Home className="size-5 shrink-0" />
                Home
              </Link>
              <Link href="/community" onClick={handleLinkClick} className={linkClass('/community')}>
                <Users className="size-5 shrink-0" />
                Community
              </Link>

              {/* Category drilldowns */}
              {navCategories.map((cat) => {
                const Icon = CATEGORY_ICONS[cat.label]
                return (
                  <button
                    key={cat.label}
                    onClick={() => openSub({ label: cat.label, items: cat.items })}
                    className={drillClass}
                  >
                    {Icon && <Icon className="size-5 shrink-0" />}
                    <span className="flex-1 text-left">{cat.label}</span>
                    <ChevronRight className="text-on-surface-variant size-5 shrink-0" />
                  </button>
                )
              })}

              {/* Tools drilldown */}
              <button
                onClick={() =>
                  openSub({
                    label: 'Tools',
                    items: TOOLS_ITEMS.map((i) => ({ label: i.label, href: i.href })),
                  })
                }
                className={drillClass}
              >
                <Wrench className="size-5 shrink-0" />
                <span className="flex-1 text-left">Tools</span>
                <ChevronRight className="text-on-surface-variant size-5 shrink-0" />
              </button>

              {/* Settings drilldown */}
              <button
                onClick={() =>
                  openSub({
                    label: 'Settings',
                    items: SETTINGS_ITEMS.map((i) => ({ label: i.label, href: i.href })),
                  })
                }
                className={drillClass}
              >
                <Settings className="size-5 shrink-0" />
                <span className="flex-1 text-left">Settings</span>
                <ChevronRight className="text-on-surface-variant size-5 shrink-0" />
              </button>
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
                    className={linkClass(item.href)}
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
