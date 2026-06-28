import { memo } from 'react'
import { MessageSquare, X } from 'lucide-react'

import { IconButton } from '@/components/ui/icon-button'
import { AppLoaderGlyph } from '@/components/AppLoader'
import { sessionItemStyles as styles } from '../AIAssistantPanel.styles'
import type { SessionItemProps } from './SessionItem.types'

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.floor(hrs / 24)
  return `${days}d`
}

export const SessionItem = memo(function SessionItem({
  session,
  isActive,
  onSelect,
  onRemove,
}: SessionItemProps): React.JSX.Element {
  const isRunning = session.status === 'thinking' || session.status === 'executing'

  return (
    <div
      onClick={onSelect}
      className={`${styles.root} ${isActive ? styles.active : styles.idle}`}
    >
      {isRunning ? (
        <AppLoaderGlyph size={10} className={styles.iconActive} />
      ) : (
        <MessageSquare
          size={10}
          className={isActive ? styles.iconActive : styles.iconIdle}
        />
      )}
      <span className={styles.title}>{session.title}</span>
      <span className={styles.time}>{relativeTime(session.updatedAt)}</span>
      <IconButton
        variant="destructive"
        size="xs"
        showOnHover
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
        tooltip="Remove"
        className={styles.removeButton}
      >
        <X size={9} />
      </IconButton>
    </div>
  )
})
