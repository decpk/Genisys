import type { Message } from '@/components/Messages/Messages.types'

import { EMPTY_MESSAGES } from '../messages-store.constants'
import type { MessagesGet, MessagesSet } from '../messages-store.types'

export function appendMessageAction(
  get: MessagesGet,
  set: MessagesSet,
  peerId: string,
  message: Message
): void {
  const { messages, activePeerId, unreadByPeer, ephemeralTtlByPeer } = get()
  const existing = messages[peerId] ?? EMPTY_MESSAGES
  if (existing.some((m) => m.id === message.id)) return

  // Stamp a disappearing-message expiry when this conversation has a TTL set
  // and the message doesn't already carry one. Additive: no TTL = no expiry.
  let stamped = message
  const ttl = ephemeralTtlByPeer[peerId] ?? 0
  if (ttl > 0 && (message.expiresAt === undefined || message.expiresAt === null)) {
    stamped = { ...message, expiresAt: message.timestamp + ttl }
  }

  const nextMessages = { ...messages, [peerId]: [...existing, stamped] }

  let nextUnread = unreadByPeer
  if (stamped.direction === 'incoming' && peerId !== activePeerId) {
    nextUnread = { ...unreadByPeer, [peerId]: (unreadByPeer[peerId] ?? 0) + 1 }
  }

  set({ messages: nextMessages, unreadByPeer: nextUnread })
}
