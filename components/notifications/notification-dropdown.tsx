'use client'

import { useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Settings, Check, BellOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { timeAgo } from '@/lib/utils/timeAgo'
import { useNotifications } from '@/lib/hooks/useNotifications'
import type { Notification, NotificationType } from '@/lib/db/schema/notifications'

const TABS: { label: string; value: NotificationType | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Content', value: 'content' },
  { label: 'Community', value: 'community' },
]

interface NotificationDropdownProps {
  open: boolean
  onClose: () => void
}

export function NotificationBell() {
  // Hook is consumed by parent — this is just the badge portion
  return null
}

export function NotificationDropdown({ open, onClose }: NotificationDropdownProps) {
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const {
    notifications: items,
    isLoading,
    activeTab,
    setActiveTab,
    markAsRead,
    markAllAsRead,
  } = useNotifications()

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open, onClose])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  function handleNotificationClick(notification: Notification) {
    if (!notification.isRead) {
      markAsRead(notification.id)
    }
    if (notification.link) {
      router.push(notification.link)
    }
    onClose()
  }

  const unreadInTab = items.filter((n) => !n.isRead).length

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 sm:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel — bottom sheet on mobile, dropdown on sm+ */}
      <div
        ref={ref}
        className="border-outline-variant/15 bg-surface-container-lowest shadow-elevated fixed right-0 bottom-0 left-0 z-50 max-h-[85dvh] overflow-hidden rounded-t-3xl border-t sm:absolute sm:top-full sm:right-0 sm:bottom-auto sm:left-auto sm:mt-2 sm:max-h-none sm:w-96 sm:rounded-2xl sm:border"
      >
        {/* Drag handle — mobile only */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="bg-outline-variant/40 h-1 w-10 rounded-full" />
        </div>
        {/* Header */}
        <div className="border-outline-variant/15 flex items-center justify-between border-b px-5 py-4">
          <h3 className="text-on-surface text-body-lg font-bold">Notifications</h3>
          <Link
            href="/settings/notifications"
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface transition-colors"
            aria-label="Notification settings"
          >
            <Settings className="size-4.5" />
          </Link>
        </div>

        {/* Tabs + Mark all as read */}
        <div className="border-outline-variant/15 border-b px-5 py-3">
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={cn(
                    'text-body-sm focus-visible:ring-primary rounded-lg px-3 py-1.5 font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none',
                    activeTab === tab.value
                      ? 'bg-primary/10 text-primary'
                      : 'text-on-surface-variant hover:bg-surface-container-high'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            {unreadInTab > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-primary text-micro font-semibold transition-opacity hover:opacity-80"
              >
                Mark all as read
              </button>
            )}
          </div>
        </div>

        {/* Notification list */}
        <div className="max-h-80 overflow-y-auto overscroll-contain">
          {isLoading ? (
            <div className="space-y-1 p-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 rounded-xl px-3 py-3">
                  <div className="bg-surface-container size-9 shrink-0 animate-pulse rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="bg-surface-container h-3.5 w-3/4 animate-pulse rounded" />
                    <div className="bg-surface-container h-3 w-full animate-pulse rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState />
          ) : (
            items.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={() => handleNotificationClick(notification)}
                onMarkRead={() => markAsRead(notification.id)}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-outline-variant/15 border-t px-5 py-3">
          <Link
            href="/settings/notifications"
            className="text-primary hover:text-primary-container text-body-sm block text-center font-semibold transition-colors"
            onClick={onClose}
          >
            Manage preferences
          </Link>
        </div>
      </div>
    </>
  )
}

/* ─── Notification Item ──────────────────────────────────────────────────── */

function NotificationItem({
  notification,
  onClick,
  onMarkRead,
}: {
  notification: Notification
  onClick: () => void
  onMarkRead: () => void
}) {
  return (
    <div
      className={cn(
        'hover:bg-surface-container-low group flex w-full items-start gap-3 px-5 py-3.5 transition-colors',
        !notification.isRead && 'bg-primary/[0.03]'
      )}
    >
      <button onClick={onClick} className="flex min-w-0 flex-1 items-start gap-3 text-left">
        {/* Avatar */}
        <NotificationAvatar notification={notification} />

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p className="text-on-surface text-body-sm truncate font-semibold">
            {notification.title}
          </p>
          <p className="text-on-surface-variant text-body-sm mt-0.5 line-clamp-2">
            {notification.body}
          </p>
          <p className="text-outline text-micro mt-1">{timeAgo(notification.createdAt)}</p>
        </div>
      </button>

      {/* Unread indicator / Mark as read */}
      <div className="mt-2 flex shrink-0 items-center">
        {!notification.isRead ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onMarkRead()
            }}
            className="text-on-surface-variant hover:text-primary group-hover:bg-surface-container flex size-6 items-center justify-center rounded-full transition-colors"
            aria-label="Mark as read"
          >
            <span className="bg-primary block size-2 rounded-full group-hover:hidden" />
            <Check className="hidden size-3.5 group-hover:block" />
          </button>
        ) : (
          <span className="size-6" />
        )}
      </div>
    </div>
  )
}

/* ─── Avatar ─────────────────────────────────────────────────────────────── */

function NotificationAvatar({ notification }: { notification: Notification }) {
  // Community notifications show actor avatar, platform notifications show logo
  if (notification.actorAvatar) {
    return (
      <div
        className="size-9 shrink-0 rounded-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url("${notification.actorAvatar}")` }}
      />
    )
  }

  // Platform logo fallback
  return (
    <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-full">
      <span className="text-overline font-black">CE</span>
    </div>
  )
}

/* ─── Empty State ────────────────────────────────────────────────────────── */

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-12">
      <div className="bg-surface-container mb-3 flex size-12 items-center justify-center rounded-full">
        <BellOff className="text-on-surface-variant size-5" />
      </div>
      <p className="text-on-surface text-body-sm font-semibold">You&apos;re all caught up</p>
      <p className="text-on-surface-variant text-micro mt-1">No new notifications</p>
    </div>
  )
}
