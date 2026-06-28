import type { MessageReaction } from '@/components/Messages/Messages.types'

import { EMPTY_REACTIONS } from '../messages-store.constants'
import type { MessagesGet, MessagesSet } from '../messages-store.types'

// Adds or removes one side's reaction (emoji) on a message. Reactions are
// ephemeral, mirroring message lifetime. When neither side reacts with an
// emoji any more, its entry is dropped; empty message maps are removed too.
export function toggleReactionAction(
  get: MessagesGet,
  set: MessagesSet,
  messageId: string,
  emoji: string,
  who: 'me' | 'peer',
  op: 'add' | 'remove'
): void {
  const { reactionsByMessage } = get()
  const current = reactionsByMessage[messageId] ?? EMPTY_REACTIONS
  const existing = current[emoji]

  const byMe = who === 'me' ? op === 'add' : existing?.byMe ?? false
  const byPeer = who === 'peer' ? op === 'add' : existing?.byPeer ?? false

  const nextForMessage = { ...current }
  if (!byMe && !byPeer) {
    delete nextForMessage[emoji]
  } else {
    const next: MessageReaction = { emoji, byMe, byPeer }
    nextForMessage[emoji] = next
  }

  const nextReactions = { ...reactionsByMessage }
  if (Object.keys(nextForMessage).length === 0) {
    delete nextReactions[messageId]
  } else {
    nextReactions[messageId] = nextForMessage
  }

  set({ reactionsByMessage: nextReactions })
}
