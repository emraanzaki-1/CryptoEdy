'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { Notification, NotificationType } from '@/lib/db/schema/notifications'

const SSE_RECONNECT_MS = 3_000 // retry delay on disconnect

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
  const [fetchedTab, setFetchedTab] = useState<NotificationType | 'all' | null>(null)
  const [activeTab, setActiveTab] = useState<NotificationType | 'all'>('all')
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const sseRef = useRef<EventSource | null>(null)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
      // will recover on SSE reconnect
    }
  }, [])

  // SSE connection — real-time push from server
  useEffect(() => {
    let cancelled = false

    function connect() {
      if (cancelled) return

      const es = new EventSource('/api/notifications/stream')
      sseRef.current = es

      es.addEventListener('connected', () => {
        // Fetch initial unread count once SSE is established
        fetchUnreadCount()
      })

      es.addEventListener('notification', (e) => {
        try {
          const notification: Notification = JSON.parse(e.data)
          // Prepend to list if it matches the current tab
          setItems((prev) => {
            if (prev.some((n) => n.id === notification.id)) return prev // dedupe
            return [notification, ...prev]
          })
          // Update unread counts
          setUnreadCount((c) => c + 1)
          setUnreadByType((prev) => ({
            ...prev,
            [notification.type]: (prev[notification.type] ?? 0) + 1,
          }))
        } catch {
          // malformed data — ignore
        }
      })

      es.onerror = () => {
        es.close()
        sseRef.current = null
        // Reconnect after delay
        if (!cancelled) {
          reconnectTimerRef.current = setTimeout(connect, SSE_RECONNECT_MS)
        }
      }
    }

    connect()

    return () => {
      cancelled = true
      sseRef.current?.close()
      sseRef.current = null
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current)
    }
  }, [fetchUnreadCount])

  // Initial load + tab change — still fetch via REST for history
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

      const notification = items.find((n) => n.id === id)
      if (notification && !notification.isRead) {
        setUnreadByType((prev) => ({
          ...prev,
          [notification.type]: Math.max(0, (prev[notification.type] ?? 0) - 1),
        }))
      }

      fetch(`/api/notifications/${id}/read`, { method: 'PATCH' }).catch(() => {
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
      setItems(prevItems)
      setUnreadCount(prevCount)
      setUnreadByType(prevByType)
    })
  }, [items, unreadCount, unreadByType, activeTab])

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
