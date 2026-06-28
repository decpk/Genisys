import { cn } from '@/lib/utils'

import { messageReactionsStyles as s } from './MessageReactions.styles'
import type { MessageReactionsProps } from './MessageReactions.types'

export function MessageReactions(props: MessageReactionsProps): React.JSX.Element | null {
  const { reactions, onToggle, isOutgoing } = props

  if (reactions.length === 0) return null

  return (
    <div className={cn(s.row, isOutgoing && s.rowOut, !isOutgoing && s.rowIn)}>
      {reactions.map((reaction) => {
        const count = Number(reaction.byMe) + Number(reaction.byPeer)
        return (
          <button
            key={reaction.emoji}
            type="button"
            className={cn(s.chip, reaction.byMe ? s.chipMine : s.chipIdle)}
            onClick={() => onToggle(reaction.emoji)}
            aria-pressed={reaction.byMe}
            aria-label={`Toggle ${reaction.emoji} reaction`}
          >
            <span className={s.emoji}>{reaction.emoji}</span>
            <span className={s.count}>{count}</span>
          </button>
        )
      })}
    </div>
  )
}
