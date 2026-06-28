import { memo } from 'react'
import { CheckCheck, Trash2, Monitor } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Tooltip } from '@/components/Tooltip'

import { getSourceLabel } from '@/frameworks/notification/source-labels'

import type { NotificationRowProps } from './NotificationRow.types'
import { TYPE_CONFIG, styles } from './NotificationRow.styles'
import { relativeTime } from './utils/relativeTime'

export const NotificationRow = memo(function NotificationRow({
  notification,
  onMarkRead,
  onRemove,
}: NotificationRowProps): React.JSX.Element {
  const config = TYPE_CONFIG[notification.type] ?? TYPE_CONFIG.info
  const { Icon } = config
  const isRead = notification.read

  return (
    <div
      className={cn(
        styles.row,
        config.accent,
        isRead ? styles.rowRead : styles.rowUnread,
      )}
    >
      {/* Unread indicator dot */}
      {!isRead && <div className={styles.unreadDot} />}

      {/* Status icon — self-start keeps it top-aligned */}
      <div className={cn(styles.iconBox, config.bg)}>
        <Icon size={14} className={config.color} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        {/* Header: TYPE · source .............. time / actions */}
        <div className={styles.headerRow}>
          <span className={cn(styles.typeBadge, config.color)}>
            {notification.type}
          </span>
          <span className={styles.dot}>·</span>
          <span className={styles.source}>{getSourceLabel(notification.source)}</span>
          {notification.channel === 'os' && (
            <Monitor size={10} className="text-muted-foreground/50" />
          )}

          {/* Timestamp (fades out on hover) */}
          <span className={cn(styles.slotWrapper)}>
            <span className={styles.timestamp}>
              {relativeTime(notification.createdAt)}
            </span>
          </span>
        </div>

        {/* Title */}
        {notification.title && (
          <p className={isRead ? styles.titleRead : styles.titleUnread}>
            {notification.title}
          </p>
        )}

        {/* Message */}
        {notification.message && (
          <p className={isRead ? styles.messageRead : styles.messageUnread}>
            {notification.message}
          </p>
        )}
      </div>

      {/* Action buttons — fade in on hover at top-right */}
      <div className={styles.actionsWrapper}>
        {!isRead && (
          <Tooltip content="Mark as read">
            <button
              onClick={() => onMarkRead(notification.id)}
              className={cn(styles.actionBtn, styles.actionBtnDefault)}
            >
              <CheckCheck size={13} />
            </button>
          </Tooltip>
        )}
        <Tooltip content="Remove">
          <button
            onClick={() => onRemove(notification.id)}
            className={cn(styles.actionBtn, styles.actionBtnDanger)}
          >
            <Trash2 size={13} />
          </button>
        </Tooltip>
      </div>
    </div>
  )
})
