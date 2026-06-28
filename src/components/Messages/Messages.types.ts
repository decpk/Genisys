// Front-end mirror of the Rust/bridge Messages payload shapes. Kept
// structurally identical to the declarations in src/tauri-api-bridge.ts.
// Conversation content is ephemeral and never persisted.

export interface MsgIdentity {
  publicKey: string
  fingerprint: string
  displayName: string
  listenPort: number
  localIp: string | null
  offline: boolean
}

export type MsgPeerStatus =
  | 'discovered'
  | 'connecting'
  | 'pending'
  | 'connected'
  | 'disconnected'

export interface MsgPeer {
  id: string
  publicKey: string
  displayName: string
  host: string
  port: number
  status: MsgPeerStatus
  verified: boolean
  keyChanged: boolean
  safetyNumber: string | null
}

export interface MsgEnvelope {
  id: string
  peerId: string
  direction: 'incoming' | 'outgoing'
  kind: 'text' | 'image'
  text: string | null
  imageBase64: string | null
  mimeType: string | null
  fileName: string | null
  timestamp: number
}

// UI-facing message. Derived from MsgEnvelope; image payloads are converted
// from base64 into an object URL for display and revoked on cleanup.
export interface Message extends MsgEnvelope {
  imageObjectUrl: string | null
  // When set, the message auto-deletes at this epoch-ms (disappearing messages).
  expiresAt?: number | null
}

export interface MessagesProps {
  className?: string
}

// An inbound chat request awaiting the user's accept/reject decision.
export interface MsgRequest {
  peerId: string
  displayName: string
  fingerprint: string
  host: string
  port: number
  safetyNumber: string | null
}

// ── Calling (audio/video over WebRTC, signaled via the encrypted channel) ──

export type CallKind = 'audio' | 'video'

export type CallStatus =
  | 'idle'
  | 'outgoing'
  | 'incoming'
  | 'connecting'
  | 'active'
  | 'ended'

export type CallSignalKind =
  | 'call-request'
  | 'accept'
  | 'reject'
  | 'busy'
  | 'cancel'
  | 'end'
  | 'offer'
  | 'answer'
  | 'candidate'
  | 'media-state'

export interface CallRequestSignal {
  t: 'call-request'
  kind: CallKind
}
export interface SimpleCallSignal {
  t: 'accept' | 'reject' | 'busy' | 'cancel' | 'end'
}
export interface SdpSignal {
  t: 'offer' | 'answer'
  sdp: string
}
export interface IceSignal {
  t: 'candidate'
  candidate: string
  sdpMid: string | null
  sdpMLineIndex: number | null
}
export interface MediaStateSignal {
  t: 'media-state'
  micOn: boolean
  camOn: boolean
  sharingScreen: boolean
}
export type CallSignal =
  | CallRequestSignal
  | SimpleCallSignal
  | SdpSignal
  | IceSignal
  | MediaStateSignal

export interface ActiveCall {
  peerId: string
  kind: CallKind
  status: CallStatus
  direction: 'incoming' | 'outgoing'
  micOn: boolean
  camOn: boolean
  sharingScreen: boolean
  startedAt: number | null
}

export interface IncomingCallInfo {
  peerId: string
  kind: CallKind
}

export interface MsgSignalEvent {
  peerId: string
  payload: string
}

// ── App control channel (reactions, disappearing-message timer) ──
// Relayed over the same Noise-encrypted tunnel as messages, but carry no
// visible bubble — they mutate existing message/conversation state.

export interface ReactionControl {
  t: 'reaction'
  messageId: string
  emoji: string
  op: 'add' | 'remove'
}

export interface EphemeralTimerControl {
  t: 'ephemeral-timer'
  ttlMs: number
}

export type ControlMessage = ReactionControl | EphemeralTimerControl

export interface MsgControlEvent {
  peerId: string
  payload: string
}

// A reaction on a single message. 1:1 chat → track only whether each side reacted.
export interface MessageReaction {
  emoji: string
  byMe: boolean
  byPeer: boolean
}
