import type {
  NotificationType,
  NotificationAction,
} from '@/frameworks/notification/notification.types'

export interface NotificationToastProps {
  /**
   * Sonner toast id. Passed by callers (`notify`/`toast`) for API compatibility;
   * the view does not consume it directly — dismissal flows through `onDismiss`.
   */
  toastId: string | number
  type: NotificationType
  /** Friendly app name (derived from the notification source) — shown as the identity line. */
  appName: string
  /** Optional custom title. When present it's emphasised and the app name becomes an eyebrow. */
  title?: string
  message: string
  /** When true, render a spinning loader in place of the type icon (progress toasts). */
  loading?: boolean
  icon?: React.ComponentType<{ size?: number; className?: string }>
  avatar?: React.ReactNode
  onClick?: () => void
  actions: NotificationAction[]
  onDismiss: () => void
}
