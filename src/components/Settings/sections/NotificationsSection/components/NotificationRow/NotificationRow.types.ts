import type { StoredNotification } from '@/frameworks/notification'

export interface NotificationRowProps {
  notification: StoredNotification
  onMarkRead: (id: string) => void
  onRemove: (id: string) => void
}
