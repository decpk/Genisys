import type { NotificationAction } from '@/frameworks/notification/notification.types'

export interface NotificationToastActionsProps {
  actions: NotificationAction[]
  onDismiss: () => void
}
