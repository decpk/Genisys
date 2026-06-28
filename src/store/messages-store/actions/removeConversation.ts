import { revokeMessageUrls } from '@/components/Messages/utils/revokeMessageUrls'

import { EMPTY_MESSAGES } from '../messages-store.constants'
import type { MessagesGet, MessagesSet } from '../messages-store.types'

// Removes a single conversation thread and its message history. This is a
// frontend-only, ephemeral clear (nothing is persisted) — image object URLs
// are revoked first to avoid leaking blobs.
export function removeConversationAction(
  get: MessagesGet,
  set: MessagesSet,
  peerId: string
): void {
  const { connectedPeers, messages, unreadByPeer, typingByPeer, activePeerId } =
    get()
  if (!connectedPeers[peerId]) return

  const removed = messages[peerId] ?? EMPTY_MESSAGES
  revokeMessageUrls(removed)

  const nextConnected = { ...connectedPeers }
  delete nextConnected[peerId]
  const nextMessages = { ...messages }
  delete nextMessages[peerId]
  const nextUnread = { ...unreadByPeer }
  delete nextUnread[peerId]
  const nextTyping = { ...typingByPeer }
  delete nextTyping[peerId]

  const { reactionsByMessage, ephemeralTtlByPeer } = get()
  const nextReactions = { ...reactionsByMessage }
  removed.forEach((m) => delete nextReactions[m.id])
  const nextTtl = { ...ephemeralTtlByPeer }
  delete nextTtl[peerId]

  const nextActivePeerId = activePeerId === peerId ? null : activePeerId

  set({
    connectedPeers: nextConnected,
    messages: nextMessages,
    unreadByPeer: nextUnread,
    typingByPeer: nextTyping,
    reactionsByMessage: nextReactions,
    ephemeralTtlByPeer: nextTtl,
    activePeerId: nextActivePeerId,
  })
}
