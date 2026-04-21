'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useAvatar } from '@/components/providers/avatar-provider'
import { Bell, Bookmark, LogOut, User, CreditCard, ChevronDown, Search, Menu } from 'lucide-react'
import { Logo } from '@/components/common/logo'
import { SearchBar } from '@/components/common/search-bar'
import { NotificationDropdown } from '@/components/notifications/notification-dropdown'
import { useNotifications } from '@/lib/hooks/useNotifications'
import { cn } from '@/lib/utils'
import { LAYOUT } from '@/lib/config/layout'
import type { NavCategory } from '@/lib/categories/getCategories'

/** Locked props interface — changes here affect DashboardShell and all consumers. */
export interface TopAppBarProps {
  user?: {
    name?: string
    email?: string
    image?: string
    isPro?: boolean
  }
  navCategories?: NavCategory[]
  onSearchClick?: () => void
  onMenuClick?: () => void
}

function useClickOutside(ref: React.RefObject<HTMLElement | null>, onClose: () => void) {
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [ref, onClose])
}

/* ─── Category Nav Dropdown ─────────────────────────────────────────────── */

function CategoryDropdown({
  label,
  items,
}: {
  label: string
  items: { label: string; href: string }[]
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isActive = items.some((i) => pathname.startsWith(i.href))

  function scheduleClose() {
    closeTimer.current = setTimeout(() => setOpen(false), 150)
  }

  function cancelClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }

  // Close on outside click — but use `click` not `mousedown` so links work
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => {
        cancelClose()
        setOpen(true)
      }}
      onMouseLeave={scheduleClose}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'text-body-sm flex items-center gap-1 rounded-lg px-3 py-2 font-medium transition-colors',
          isActive
            ? 'text-on-surface font-semibold'
            : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
        )}
      >
        {label}
        <ChevronDown className={cn('size-3.5 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute top-full left-0 z-50 min-w-[180px] pt-1">
          <div className="border-outline-variant/15 bg-surface-container-lowest overflow-hidden rounded-xl border shadow-lg">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface text-body-sm block px-4 py-2.5 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function CategoryNav({ categories }: { categories: NavCategory[] }) {
  return (
    <nav className="hidden items-center gap-1 md:flex">
      {categories.map((cat) => (
        <CategoryDropdown key={cat.label} label={cat.label} items={cat.items} />
      ))}
    </nav>
  )
}

/* ─── User Dropdown ─────────────────────────────────────────────────────── */

function UserDropdown({
  open,
  onClose,
  user,
}: {
  open: boolean
  onClose: () => void
  user?: TopAppBarProps['user']
}) {
  const ref = useRef<HTMLDivElement>(null)
  useClickOutside(ref, onClose)

  if (!open) return null

  const menuItems = [
    { href: '/settings/profile', label: 'Profile & Settings', icon: User },
    { href: '/saved', label: 'Bookmarks', icon: Bookmark },
    { href: '/settings/plans', label: 'Plans & Subscription', icon: CreditCard },
  ]

  return (
    <div
      ref={ref}
      className="border-outline-variant/15 bg-surface-container-lowest absolute top-full right-0 mt-2 w-64 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border shadow-lg"
    >
      <div className="border-outline-variant/15 border-b px-5 py-4">
        <div className="flex items-center gap-2">
          <p className="text-on-surface text-body-sm font-bold">{user?.name ?? 'User'}</p>
          {user?.isPro && (
            <span className="bg-tertiary-container/90 text-on-tertiary-container text-overline rounded-full px-2 py-0.5 font-bold uppercase">
              PRO
            </span>
          )}
        </div>
        {user?.email && <p className="text-on-surface-variant text-micro mt-0.5">{user.email}</p>}
      </div>
      <div className="py-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface text-body-sm flex items-center gap-3 px-5 py-2.5 font-medium transition-colors"
            onClick={onClose}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        ))}
      </div>
      <div className="border-outline-variant/15 border-t py-2">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="text-error hover:bg-error-container/20 text-body-sm flex w-full items-center gap-3 px-5 py-2.5 font-medium transition-colors"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </div>
    </div>
  )
}

/* ─── Top App Bar ───────────────────────────────────────────────────────── */

export function TopAppBar({
  user: serverUser,
  navCategories = [],
  onSearchClick,
  onMenuClick,
}: TopAppBarProps) {
  const { avatarUrl } = useAvatar()
  const [notifOpen, setNotifOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const { unreadCount } = useNotifications()

  // Use avatar context (updates instantly on upload) over server-passed prop
  const user = {
    ...serverUser,
    image: avatarUrl ?? serverUser?.image,
  }

  return (
    <header
      className={`bg-surface sticky top-0 z-50 flex items-center gap-6 ${LAYOUT.appBar.px} ${LAYOUT.appBar.py} whitespace-nowrap`}
    >
      {/* Mobile menu button */}
      {onMenuClick && (
        <button
          type="button"
          onClick={onMenuClick}
          className="bg-surface-container text-on-surface hover:bg-surface-container-high border-outline-variant/15 flex aspect-square h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border transition-colors lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>
      )}

      {/* Logo */}
      <Link href="/feed" className="shrink-0">
        <Logo />
      </Link>

      {/* Category nav */}
      <CategoryNav categories={navCategories} />

      {/* Right side */}
      <div className="flex flex-1 items-center justify-end gap-3">
        {/* Mobile search button */}
        <button
          type="button"
          onClick={onSearchClick}
          className="bg-surface-container text-on-surface hover:bg-surface-container-high flex size-10 cursor-pointer items-center justify-center rounded-full transition-colors md:hidden"
        >
          <Search className="size-5" />
        </button>

        <div className="hidden flex-1 justify-end md:flex">
          <SearchBar className="max-w-sm" onClick={onSearchClick} />
        </div>

        {/* Notification bell */}
        <div className="relative">
          <button
            onClick={() => {
              setNotifOpen((v) => !v)
              setUserOpen(false)
            }}
            className="bg-surface-container text-on-surface hover:bg-surface-container-high relative flex size-10 cursor-pointer items-center justify-center rounded-full transition-colors"
          >
            <Bell className="size-5" />
            {unreadCount > 0 && (
              <span className="bg-error text-on-error absolute -top-0.5 -right-0.5 flex min-w-[18px] items-center justify-center rounded-full px-1 py-0.5 text-[10px] leading-none font-bold">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
          <NotificationDropdown open={notifOpen} onClose={() => setNotifOpen(false)} />
        </div>

        {/* User avatar */}
        <div className="relative">
          <button
            onClick={() => {
              setUserOpen((v) => !v)
              setNotifOpen(false)
            }}
            className="bg-surface-container-high hover:ring-primary/30 size-10 cursor-pointer rounded-full bg-cover bg-center bg-no-repeat ring-2 ring-transparent transition-all"
            style={{ backgroundImage: user?.image ? `url("${user.image}")` : undefined }}
          >
            {!user?.image && (
              <div className="bg-primary-fixed text-on-primary-fixed text-body-sm flex size-full items-center justify-center rounded-full font-bold">
                {user?.name?.[0]?.toUpperCase() ?? 'U'}
              </div>
            )}
          </button>
          <UserDropdown open={userOpen} onClose={() => setUserOpen(false)} user={user} />
        </div>
      </div>
    </header>
  )
}
