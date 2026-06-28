import { useCallback, useMemo } from 'react'

import type { Message, MessageReaction } from '@/components/Messages/Messages.types'
import { sendControl } from '@/components/Messages/api/sendControl'
import { formatMessageTime } from '@/components/Messages/utils/formatMessageTime'
import { EMPTY_REACTIONS } from '@/store/messages-store/messages-store.constants'
import { useMessagesStore } from '@/store/messages-store'

interface MessageBubbleData {
  isOutgoing: boolean
  isImage: boolean
  time: string
  reactions: MessageReaction[]
  hasExpiry: boolean
  onToggleReaction: (emoji: string) => void
}

// Smart layer for a single message bubble: derives display flags, resolves
// this message's reactions from the store (stable empty fallback to avoid a
// render loop), and toggles the local user's reaction both locally and over
// the encrypted control channel.
export function useMessageBubbleData(message: Message): MessageBubbleData {
  const reactionMap = useMessagesStore(
    (s) => s.reactionsByMessage[message.id] ?? EMPTY_REACTIONS
  )
  const toggleReaction = useMessagesStore((s) => s.toggleReaction)

  const reactions = useMemo(() => Object.values(reactionMap), [reactionMap])

  const onToggleReaction = useCallback(
    (emoji: string) => {
      const op = reactionMap[emoji]?.byMe ? 'remove' : 'add'
      toggleReaction(message.id, emoji, 'me', op)
      void sendControl(message.peerId, {
        t: 'reaction',
        messageId: message.id,
        emoji,
        op,
      }).catch(() => undefined)
    },
    [reactionMap, message.id, message.peerId, toggleReaction]
  )

  return {
    isOutgoing: message.direction === 'outgoing',
    isImage: message.kind === 'image' && Boolean(message.imageObjectUrl),
    time: formatMessageTime(message.timestamp),
    reactions,
    hasExpiry: typeof message.expiresAt === 'number',
    onToggleReaction,
  }
}
