import type { Message, MessageReaction } from '@/components/Messages/Messages.types'

import type { MessagesState } from './messages-store.types'

// Hoisted stable empty reference — returned from selectors so undefined
// fallbacks never produce a fresh literal that would trigger a render loop.
export const EMPTY_MESSAGES: Message[] = []

// Stable empty reference for unread counts (avoids fresh-literal render loops).
export const EMPTY_UNREAD: Record<string, number> = {}

// Stable empty reference for a message's reaction map (emoji → reaction).
export const EMPTY_REACTIONS: Record<string, MessageReaction> = {}

export const MESSAGES_INITIAL_STATE: MessagesState = {
  identity: null,
  discoveredPeers: {},
  connectedPeers: {},
  incomingRequests: {},
  activePeerId: null,
  messages: {},
  typingByPeer: {},
  unreadByPeer: {},
  isStarted: false,
  rightPanelOpen: false,
  call: null,
  incomingCall: null,
  reactionsByMessage: {},
  ephemeralTtlByPeer: {},
}
