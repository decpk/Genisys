import { useCallback, useEffect, useRef, useState } from 'react'
import type { StoredNotification, NotificationType, NotificationChannel } from '@/frameworks/notification'

interface NotificationFilters {
  notificationType?: NotificationType
  channel?: NotificationChannel
  source?: string
  read?: boolean
}

interface UseNotificationsDataReturn {
  notifications: StoredNotification[]
  hasMore: boolean
  isLoading: boolean
  filters: NotificationFilters
  setFilters: (filters: NotificationFilters) => void
  loadMore: () => void
  markRead: (id: string) => void
  markAllRead: () => void
  removeOne: (id: string) => void
  removeAll: () => void
  refresh: () => void
}

const PAGE_SIZE = 50

export function useNotificationsData(): UseNotificationsDataReturn {
  const [notifications, setNotifications] = useState<StoredNotification[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [filters, setFiltersState] = useState<NotificationFilters>({})
  const loadingRef = useRef(false)

  const load = useCallback(
    async (cursor?: string, append = false) => {
      if (loadingRef.current) return
      loadingRef.current = true
      setIsLoading(true)

      try {
        const page = await window.api.loadNotifications(cursor, PAGE_SIZE, {
          notificationType: filters.notificationType,
          channel: filters.channel,
          source: filters.source,
          read: filters.read,
        })

        const items: StoredNotification[] = page.items.map((item: any) => ({
          ...item,
          type: item.type as NotificationType,
          channel: item.channel as NotificationChannel,
          meta: item.meta ? (typeof item.meta === 'string' ? JSON.parse(item.meta) : item.meta) : null,
        }))

        setNotifications((prev) => (append ? [...prev, ...items] : items))
        setHasMore(page.hasMore)
      } catch {
        /* silently ignore */
      } finally {
        loadingRef.current = false
        setIsLoading(false)
      }
    },
    [filters],
  )

  // Load initial data when filters change
  useEffect(() => {
    load()
  }, [load])

  const loadMore = useCallback(() => {
    if (!hasMore || isLoading) return
    const lastItem = notifications[notifications.length - 1]
    if (lastItem) {
      load(lastItem.createdAt, true)
    }
  }, [hasMore, isLoading, notifications, load])

  const setFilters = useCallback((newFilters: NotificationFilters) => {
    setFiltersState(newFilters)
  }, [])

  const markRead = useCallback(async (id: string) => {
    await window.api.markNotificationRead(id)
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }, [])

  const markAllRead = useCallback(async () => {
    await window.api.markAllNotificationsRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const removeOne = useCallback(async (id: string) => {
    await window.api.removeNotification(id)
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const removeAll = useCallback(async () => {
    await window.api.removeAllNotifications()
    setNotifications([])
    setHasMore(false)
  }, [])

  const refresh = useCallback(() => {
    load()
  }, [load])

  return {
    notifications,
    hasMore,
    isLoading,
    filters,
    setFilters,
    loadMore,
    markRead,
    markAllRead,
    removeOne,
    removeAll,
    refresh,
  }
}
