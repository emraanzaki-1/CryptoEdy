'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useAvatar } from '@/components/providers/avatar-provider'
import {
  Bell,
  Bookmark,
  Settings,
  LogOut,
  User,
  CreditCard,
  ChevronDown,
  Search,
} from 'lucide-react'
import { Logo } from '@/components/common/logo'
import { SearchBar } from '@/components/common/search-bar'
import { cn } from '@/lib/utils'
import type { NavCategory } from '@/lib/categories/getCategories'

interface TopAppBarProps {
  user?: {
    name?: string
    email?: string
    image?: string
    isPro?: boolean
  }
  navCategories?: NavCategory[]
  onSearchClick?: () => void
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
          'flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
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
                className="text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface block px-4 py-2.5 text-sm transition-colors"
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

/* ─── Notification Dropdown ─────────────────────────────────────────────── */

const mockNotifications = [
  {
    id: '1',
    title: 'New Pro Research Alert',
    description: 'Bitcoin Dominance Cycle Analysis is now available.',
    time: '2m ago',
    unread: true,
  },
  {
    id: '2',
    title: 'Daily Market Brief',
    description: 'Your morning market summary is ready.',
    time: '1h ago',
    unread: true,
  },
  {
    id: '3',
    title: 'Price Target Hit',
    description: 'ETH reached your $4,200 price alert.',
    time: '3h ago',
    unread: false,
  },
  {
    id: '4',
    title: 'New Follower',
    description: 'CryptoWhale42 started following your portfolio.',
    time: '5h ago',
    unread: false,
  },
]

function NotificationDropdown({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useClickOutside(ref, onClose)

  if (!open) return null

  const unreadCount = mockNotifications.filter((n) => n.unread).length

  return (
    <div
      ref={ref}
      className="border-outline-variant/15 bg-surface-container-lowest absolute top-full right-0 mt-2 w-96 overflow-hidden rounded-2xl border shadow-lg"
    >
      <div className="border-outline-variant/15 flex items-center justify-between border-b px-5 py-4">
        <h3 className="text-on-surface text-sm font-bold">Notifications</h3>
        {unreadCount > 0 && (
          <span className="bg-primary text-on-primary text-overline rounded-full px-2 py-0.5 font-bold">
            {unreadCount} new
          </span>
        )}
      </div>
      <div className="max-h-80 overflow-y-auto">
        {mockNotifications.map((notification) => (
          <button
            key={notification.id}
            className="hover:bg-surface-container-low flex w-full items-start gap-3 px-5 py-3.5 text-left transition-colors"
          >
            {notification.unread && (
              <span className="bg-primary mt-2 size-2 shrink-0 rounded-full" />
            )}
            {!notification.unread && <span className="mt-2 size-2 shrink-0" />}
            <div className="min-w-0 flex-1">
              <p className="text-on-surface truncate text-sm font-semibold">{notification.title}</p>
              <p className="text-on-surface-variant mt-0.5 truncate text-sm">
                {notification.description}
              </p>
              <p className="text-outline mt-1 text-xs">{notification.time}</p>
            </div>
          </button>
        ))}
      </div>
      <div className="border-outline-variant/15 border-t px-5 py-3">
        <Link
          href="/settings/notifications"
          className="text-primary hover:text-primary-container block text-center text-sm font-semibold transition-colors"
          onClick={onClose}
        >
          View all notifications
        </Link>
      </div>
    </div>
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
    { href: '/settings/profile', label: 'Profile', icon: User },
    { href: '/saved', label: 'Saved', icon: Bookmark },
    { href: '/settings/plans', label: 'Plans & Subscription', icon: CreditCard },
    { href: '/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div
      ref={ref}
      className="border-outline-variant/15 bg-surface-container-lowest absolute top-full right-0 mt-2 w-64 overflow-hidden rounded-2xl border shadow-lg"
    >
      <div className="border-outline-variant/15 border-b px-5 py-4">
        <div className="flex items-center gap-2">
          <p className="text-on-surface text-sm font-bold">{user?.name ?? 'User'}</p>
          {user?.isPro && (
            <span className="bg-tertiary-container/90 text-on-tertiary-container text-overline rounded-full px-2 py-0.5 font-bold uppercase">
              PRO
            </span>
          )}
        </div>
        {user?.email && <p className="text-on-surface-variant mt-0.5 text-xs">{user.email}</p>}
      </div>
      <div className="py-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-colors"
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
          className="text-error hover:bg-error-container/20 flex w-full items-center gap-3 px-5 py-2.5 text-sm font-medium transition-colors"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </div>
    </div>
  )
}

/* ─── Top App Bar ───────────────────────────────────────────────────────── */

export function TopAppBar({ user: serverUser, navCategories = [], onSearchClick }: TopAppBarProps) {
  const { avatarUrl } = useAvatar()
  const [notifOpen, setNotifOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)

  // Use avatar context (updates instantly on upload) over server-passed prop
  const user = {
    ...serverUser,
    image: avatarUrl ?? serverUser?.image,
  }

  return (
    <header className="bg-surface sticky top-0 z-50 flex items-center gap-6 px-6 py-3 whitespace-nowrap lg:px-10">
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
            className="bg-surface-container text-on-surface hover:bg-surface-container-high relative flex size-10 cursor-pointer items-center justify-center overflow-hidden rounded-full transition-colors"
          >
            <Bell className="size-5" />
            <span className="bg-error ring-surface-container-lowest absolute top-2 right-2 size-2 rounded-full ring-2" />
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
              <div className="bg-primary-fixed text-on-primary-fixed flex size-full items-center justify-center rounded-full text-sm font-bold">
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
