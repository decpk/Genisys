import type {
  ActiveCall,
  CallKind,
  CallStatus,
  IncomingCallInfo,
  Message,
  MessageReaction,
  MsgIdentity,
  MsgPeer,
  MsgRequest,
} from '@/components/Messages/Messages.types'

export interface MessagesState {
  identity: MsgIdentity | null
  discoveredPeers: Record<string, MsgPeer>
  connectedPeers: Record<string, MsgPeer>
  incomingRequests: Record<string, MsgRequest>
  activePeerId: string | null
  messages: Record<string, Message[]>
  typingByPeer: Record<string, boolean>
  unreadByPeer: Record<string, number>
  isStarted: boolean
  rightPanelOpen: boolean
  call: ActiveCall | null
  incomingCall: IncomingCallInfo | null
  // messageId → (emoji → reaction). Reactions are ephemeral like messages.
  reactionsByMessage: Record<string, Record<string, MessageReaction>>
  // peerId → disappearing-message TTL in ms (0 / absent = off).
  ephemeralTtlByPeer: Record<string, number>
}

export interface MessagesActions {
  setIdentity: (identity: MsgIdentity) => void
  upsertDiscoveredPeer: (peer: MsgPeer) => void
  removeDiscoveredPeer: (peerId: string) => void
  clearDiscoveredPeers: () => void
  upsertPeer: (peer: MsgPeer) => void
  addRequest: (request: MsgRequest) => void
  removeRequest: (peerId: string) => void
  removeConversation: (peerId: string) => void
  setActivePeer: (peerId: string | null) => void
  appendMessage: (peerId: string, message: Message) => void
  setTyping: (peerId: string, isTyping: boolean) => void
  setStarted: (isStarted: boolean) => void
  setRightPanelOpen: (open: boolean) => void
  startOutgoingCall: (peerId: string, kind: CallKind) => void
  setIncomingCall: (info: IncomingCallInfo | null) => void
  setCallStatus: (status: CallStatus) => void
  updateCallFlags: (
    flags: Partial<Pick<ActiveCall, 'micOn' | 'camOn' | 'sharingScreen'>>
  ) => void
  setCallActive: () => void
  endCall: () => void
  toggleReaction: (
    messageId: string,
    emoji: string,
    who: 'me' | 'peer',
    op: 'add' | 'remove'
  ) => void
  setEphemeralTtl: (peerId: string, ttlMs: number) => void
  removeExpiredMessages: (now: number) => void
  clearAll: () => void
}

export type MessagesStore = MessagesState & MessagesActions
export type MessagesGet = () => MessagesStore
export type MessagesSet = (partial: Partial<MessagesState>) => void
