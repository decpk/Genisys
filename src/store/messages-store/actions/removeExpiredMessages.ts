import { revokeMessageUrls } from '@/components/Messages/utils/revokeMessageUrls'

import type { MessagesGet, MessagesSet } from '../messages-store.types'

// Sweeps every conversation and drops messages whose `expiresAt` has passed,
// revoking any image blob URLs and clearing their reactions. Invoked on a
// timer by the ephemeral reaper hook. No-op when nothing has expired.
export function removeExpiredMessagesAction(
  get: MessagesGet,
  set: MessagesSet,
  now: number
): void {
  const { messages, reactionsByMessage } = get()

  const expiredIds: string[] = []
  const nextMessages: Record<string, typeof messages[string]> = {}
  let changed = false

  for (const [peerId, list] of Object.entries(messages)) {
    const kept = list.filter((m) => {
      const expired = typeof m.expiresAt === 'number' && m.expiresAt <= now
      if (expired) expiredIds.push(m.id)
      return !expired
    })
    if (kept.length !== list.length) {
      changed = true
      revokeMessageUrls(list.filter((m) => kept.indexOf(m) === -1))
    }
    nextMessages[peerId] = kept
  }

  if (!changed) return

  let nextReactions = reactionsByMessage
  if (expiredIds.length > 0) {
    nextReactions = { ...reactionsByMessage }
    expiredIds.forEach((id) => delete nextReactions[id])
  }

  set({ messages: nextMessages, reactionsByMessage: nextReactions })
}
