'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { Notification, NotificationType } from '@/lib/db/schema/notifications'

const POLL_INTERVAL_MS = 30_000 // 30 seconds

interface UnreadCount {
  count: number
  byType: Record<string, number>
}

interface UseNotificationsReturn {
  notifications: Notification[]
  unreadCount: number
  unreadByType: Record<string, number>
  isLoading: boolean
  activeTab: NotificationType | 'all'
  setActiveTab: (tab: NotificationType | 'all') => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  hasMore: boolean
  loadMore: () => void
}

export function useNotifications(): UseNotificationsReturn {
  const [items, setItems] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [unreadByType, setUnreadByType] = useState<Record<string, number>>({})
  // Track which tab has been fetched — derive loading from mismatch
  const [fetchedTab, setFetchedTab] = useState<NotificationType | 'all' | null>(null)
  const [activeTab, setActiveTab] = useState<NotificationType | 'all'>('all')
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const isLoading = fetchedTab !== activeTab

  // Fetch notifications list
  const fetchNotifications = useCallback(
    async (tab: NotificationType | 'all', cursor?: string | null) => {
      const params = new URLSearchParams()
      if (tab !== 'all') params.set('type', tab)
      if (cursor) params.set('cursor', cursor)
      params.set('limit', '10')

      const res = await fetch(`/api/notifications?${params}`)
      if (!res.ok) return null
      return res.json() as Promise<{ items: Notification[]; nextCursor: string | null }>
    },
    []
  )

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications/unread-count')
      if (!res.ok) return
      const data: UnreadCount = await res.json()
      setUnreadCount(data.count)
      setUnreadByType(data.byType)
    } catch {
      // silently fail — polling will retry
    }
  }, [])

  // Initial load + tab change
  useEffect(() => {
    let cancelled = false

    fetchNotifications(activeTab).then((data) => {
      if (cancelled || !data) return
      setItems(data.items)
      setNextCursor(data.nextCursor)
      setFetchedTab(activeTab)
    })

    return () => {
      cancelled = true
    }
  }, [activeTab, fetchNotifications])

  // Initial unread count + polling
  useEffect(() => {
    // Wrap in async callback to satisfy react-hooks/set-state-in-effect
    const poll = () => {
      fetchUnreadCount()
    }

    // Initial fetch on a microtask to avoid synchronous setState in effect body
    Promise.resolve().then(poll)

    pollingRef.current = setInterval(poll, POLL_INTERVAL_MS)
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [fetchUnreadCount])

  // Load more (pagination)
  const loadMore = useCallback(async () => {
    if (!nextCursor) return
    const data = await fetchNotifications(activeTab, nextCursor)
    if (!data) return
    setItems((prev) => [...prev, ...data.items])
    setNextCursor(data.nextCursor)
  }, [activeTab, nextCursor, fetchNotifications])

  // Mark single as read — optimistic
  const markAsRead = useCallback(
    (id: string) => {
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
      setUnreadCount((c) => Math.max(0, c - 1))

      // Find the notification type to decrement byType
      const notification = items.find((n) => n.id === id)
      if (notification && !notification.isRead) {
        setUnreadByType((prev) => ({
          ...prev,
          [notification.type]: Math.max(0, (prev[notification.type] ?? 0) - 1),
        }))
      }

      fetch(`/api/notifications/${id}/read`, { method: 'PATCH' }).catch(() => {
        // Revert on failure — refetch
        fetchNotifications(activeTab).then((data) => {
          if (data) setItems(data.items)
        })
        fetchUnreadCount()
      })
    },
    [items, activeTab, fetchNotifications, fetchUnreadCount]
  )

  // Mark all as read — optimistic
  const markAllAsRead = useCallback(() => {
    const prevItems = items
    const prevCount = unreadCount
    const prevByType = unreadByType

    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })))

    if (activeTab === 'all') {
      setUnreadCount(0)
      setUnreadByType({})
    } else {
      const tabCount = unreadByType[activeTab] ?? 0
      setUnreadCount((c) => Math.max(0, c - tabCount))
      setUnreadByType((prev) => ({ ...prev, [activeTab]: 0 }))
    }

    const params = activeTab !== 'all' ? `?type=${activeTab}` : ''
    fetch(`/api/notifications/read-all${params}`, { method: 'PATCH' }).catch(() => {
      // Revert on failure
      setItems(prevItems)
      setUnreadCount(prevCount)
      setUnreadByType(prevByType)
    })
  }, [items, unreadCount, unreadByType, activeTab])

  // Tab change handler
  const handleSetActiveTab = useCallback((tab: NotificationType | 'all') => {
    setActiveTab(tab)
  }, [])

  return {
    notifications: items,
    unreadCount,
    unreadByType,
    isLoading,
    activeTab,
    setActiveTab: handleSetActiveTab,
    markAsRead,
    markAllAsRead,
    hasMore: nextCursor !== null,
    loadMore,
  }
}
