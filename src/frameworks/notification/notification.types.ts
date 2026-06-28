// ─── Notification Types ──────────────────────────────────────────

export type NotificationType = 'success' | 'error' | 'warning' | 'info'
export type NotificationChannel = 'app' | 'os'

export interface NotificationAction {
  label: string
  onClick: () => void
}

export interface NotifyOptions {
  /** Required — identifies the origin (e.g. 'chat', 'explorer', 'library') */
  source: string;
  /** Notification message (trimmed to 3 lines in app toasts) */
  message: string;
  /** Notification type — determines heading color and icon. Default: 'info' */
  type?: NotificationType;
  /** Delivery channel: 'app' (in-app toast) or 'os' (native OS notification). Default: 'app' */
  channel?: NotificationChannel;
  /** Custom title. If omitted, auto-generated from type ('Success', 'Error', etc.) */
  title?: string;
  /** Icon component to render in the toast (app channel only) */
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  /** Optional avatar/media node rendered in place of the type icon (app channel only) */
  avatar?: React.ReactNode;
  /** Click handler for the toast body (app channel only). When set, the content area becomes clickable. */
  onClick?: () => void;
  /** Icon name string — stored in DB for reference */
  iconName?: string;
  /** Up to 2 action buttons shown below the message (app channel only) */
  actions?: NotificationAction[];
  /** Auto-dismiss duration in ms (app channel only). Default: 6000 */
  duration?: number;
  /**
   * Stable identity for coalescing repeats. When set, a new notification with
   * the same key REPLACES the existing toast (and upserts its history row)
   * instead of stacking a fresh copy — so spamming the same action surfaces a
   * single, refreshed notification rather than a sprawling pile of duplicates.
   * Omit for one-off notifications (a random id is generated).
   */
  dedupeKey?: string;
  /** Extensible metadata — stored as JSON in DB for future filtering */
  meta?: Record<string, unknown>;
}

export interface StoredNotification {
  id: string
  type: NotificationType
  channel: NotificationChannel
  source: string
  title: string
  message: string
  icon: string | null
  actions: string | null
  meta: Record<string, unknown> | null
  read: boolean
  createdAt: string
  expiresAt: string | null
}

export interface NotificationPage {
  items: StoredNotification[]
  hasMore: boolean
}

export interface NotificationFilters {
  notificationType?: NotificationType
  channel?: NotificationChannel
  source?: string
  read?: boolean
}
