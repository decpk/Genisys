import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react'

import type { NotificationType } from '@/frameworks/notification/notification.types'

const TYPE_CONFIG: Record<
  NotificationType,
  { color: string; bg: string; Icon: React.ComponentType<{ size?: number; className?: string }> }
> = {
  success: { color: 'text-success', bg: 'bg-success/15', Icon: CheckCircle2 },
  error: { color: 'text-destructive', bg: 'bg-destructive/15', Icon: XCircle },
  warning: { color: 'text-warning', bg: 'bg-warning/15', Icon: AlertTriangle },
  info: { color: 'text-info', bg: 'bg-info/15', Icon: Info },
}

/** Resolve the color / background / icon triple for a notification type. */
export function getNotificationTypeConfig(
  type: NotificationType,
): { color: string; bg: string; Icon: React.ComponentType<{ size?: number; className?: string }> } {
  return TYPE_CONFIG[type]
}
