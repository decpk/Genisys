import type { NotificationType } from '@/frameworks/notification/notification.types'

export interface NotificationToastLeadingProps {
  type: NotificationType
  loading?: boolean
  icon?: React.ComponentType<{ size?: number; className?: string }>
  avatar?: React.ReactNode
}
