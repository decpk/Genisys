import { create } from 'zustand'

import { addRequestAction } from './messages-store/actions/addRequest'
import { appendMessageAction } from './messages-store/actions/appendMessage'
import { clearAllAction } from './messages-store/actions/clearAll'
import { clearDiscoveredPeersAction } from './messages-store/actions/clearDiscoveredPeers'
import { endCallAction } from './messages-store/actions/endCall'
import { removeConversationAction } from './messages-store/actions/removeConversation'
import { removeDiscoveredPeerAction } from './messages-store/actions/removeDiscoveredPeer'
import { removeExpiredMessagesAction } from './messages-store/actions/removeExpiredMessages'
import { removeRequestAction } from './messages-store/actions/removeRequest'
import { setActivePeerAction } from './messages-store/actions/setActivePeer'
import { setCallActiveAction } from './messages-store/actions/setCallActive'
import { setCallStatusAction } from './messages-store/actions/setCallStatus'
import { setEphemeralTtlAction } from './messages-store/actions/setEphemeralTtl'
import { setIdentityAction } from './messages-store/actions/setIdentity'
import { setIncomingCallAction } from './messages-store/actions/setIncomingCall'
import { setRightPanelOpenAction } from './messages-store/actions/setRightPanelOpen'
import { setStartedAction } from './messages-store/actions/setStarted'
import { setTypingAction } from './messages-store/actions/setTyping'
import { startOutgoingCallAction } from './messages-store/actions/startOutgoingCall'
import { toggleReactionAction } from './messages-store/actions/toggleReaction'
import { updateCallFlagsAction } from './messages-store/actions/updateCallFlags'
import { upsertDiscoveredPeerAction } from './messages-store/actions/upsertDiscoveredPeer'
import { upsertPeerAction } from './messages-store/actions/upsertPeer'
import { MESSAGES_INITIAL_STATE } from './messages-store/messages-store.constants'
import type {
  MessagesActions,
  MessagesState,
} from './messages-store/messages-store.types'

export const useMessagesStore = create<MessagesState & MessagesActions>(
  (set, get) => ({
    ...MESSAGES_INITIAL_STATE,
    setIdentity: (identity) => setIdentityAction(set, identity),
    upsertDiscoveredPeer: (peer) => upsertDiscoveredPeerAction(get, set, peer),
    removeDiscoveredPeer: (peerId) =>
      removeDiscoveredPeerAction(get, set, peerId),
    clearDiscoveredPeers: () => clearDiscoveredPeersAction(set),
    upsertPeer: (peer) => upsertPeerAction(get, set, peer),
    addRequest: (request) => addRequestAction(get, set, request),
    removeConversation: (peerId) =>
      removeConversationAction(get, set, peerId),
    removeRequest: (peerId) => removeRequestAction(get, set, peerId),
    setActivePeer: (peerId) => setActivePeerAction(get, set, peerId),
    appendMessage: (peerId, message) =>
      appendMessageAction(get, set, peerId, message),
    setTyping: (peerId, isTyping) => setTypingAction(get, set, peerId, isTyping),
    setStarted: (isStarted) => setStartedAction(set, isStarted),
    setRightPanelOpen: (open) => setRightPanelOpenAction(set, open),
    startOutgoingCall: (peerId, kind) =>
      startOutgoingCallAction(get, set, peerId, kind),
    setIncomingCall: (info) => setIncomingCallAction(get, set, info),
    setCallStatus: (status) => setCallStatusAction(get, set, status),
    updateCallFlags: (flags) => updateCallFlagsAction(get, set, flags),
    setCallActive: () => setCallActiveAction(get, set),
    endCall: () => endCallAction(get, set),
    toggleReaction: (messageId, emoji, who, op) =>
      toggleReactionAction(get, set, messageId, emoji, who, op),
    setEphemeralTtl: (peerId, ttlMs) =>
      setEphemeralTtlAction(get, set, peerId, ttlMs),
    removeExpiredMessages: (now) => removeExpiredMessagesAction(get, set, now),
    clearAll: () => clearAllAction(get, set),
  })
)
