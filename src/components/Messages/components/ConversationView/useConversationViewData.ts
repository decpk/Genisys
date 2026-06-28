import { EMPTY_MESSAGES } from '@/store/messages-store/messages-store.constants'
import { useMessagesStore } from '@/store/messages-store'

import type { ConversationViewData } from './ConversationView.types'

export function useConversationViewData(): ConversationViewData {
  // Select stable references (record objects), then index in the hook body so
  // selectors never return fresh literals. EMPTY_MESSAGES is a hoisted stable
  // fallback to keep references constant when a peer has no messages yet.
  const activePeerId = useMessagesStore((s) => s.activePeerId)
  const connectedPeers = useMessagesStore((s) => s.connectedPeers)
  const messagesMap = useMessagesStore((s) => s.messages)
  const typingByPeer = useMessagesStore((s) => s.typingByPeer)

  let peer = null
  let messages = EMPTY_MESSAGES
  let isPeerTyping = false

  if (activePeerId) {
    peer = connectedPeers[activePeerId] ?? null
    messages = messagesMap[activePeerId] ?? EMPTY_MESSAGES
    isPeerTyping = Boolean(typingByPeer[activePeerId])
  }

  return { activePeerId, peer, messages, isPeerTyping }
}
