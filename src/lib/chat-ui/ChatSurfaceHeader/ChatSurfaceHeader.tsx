import { memo } from 'react'
import { Sparkles } from 'lucide-react'

import { cn } from '@/lib/utils'

import { chatSurfaceHeaderStyles as styles } from './ChatSurfaceHeader.styles'
import type { ChatSurfaceHeaderProps } from './ChatSurfaceHeader.types'

/**
 * Shared top-bar header used by Chat (`ChatHeader`) and every AI Assistant
 * right-panel surface. Title + icon on the left, caller-provided actions slot
 * on the right.
 */
export const ChatSurfaceHeader = memo(function ChatSurfaceHeader(
  props: ChatSurfaceHeaderProps,
): React.JSX.Element {
  const { title, icon, actions, className } = props
  const Icon = icon ?? Sparkles

  let actionsNode: React.ReactNode = null
  if (actions) actionsNode = <div className={styles.actions}>{actions}</div>

  return (
    <div className={cn(styles.root, className)}>
      <div className={styles.title}>
        <Icon size={14} className={styles.titleIcon} />
        <span className={styles.titleText}>{title}</span>
      </div>
      {actionsNode}
    </div>
  )
})
