import type { CallKind, CallSignal, IceSignal } from '@/components/Messages/Messages.types'
import type { PeerCall } from './PeerCall'

/**
 * Mutable, module-level holder for everything a single live call needs that
 * CANNOT live in the (serializable) zustand store — the RTCPeerConnection
 * wrapper, the MediaStreams, audio elements, timers and the UI subscriber set.
 * Exactly one instance exists (see callController.ts); it is reset to its empty
 * shape by `teardown` on every terminal transition.
 */
export interface CallControllerContext {
  peerCall: PeerCall | null
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  pendingRemoteIce: IceSignal[]
  ringAudio: HTMLAudioElement | null
  ringbackAudio: HTMLAudioElement | null
  ringTimeout: ReturnType<typeof setTimeout> | null
  toastId: string | null
  remoteFingerprint: string | null
  listeners: Set<() => void>
}

/**
 * Public surface of the singleton call controller. The UI drives calls through
 * these methods and subscribes for stream/state changes via `subscribe` +
 * `getLocalStream` / `getRemoteStream`. Serializable call state still lives in
 * the messages store.
 */
export interface CallControllerApi {
  startCall: (peerId: string, kind: CallKind) => Promise<void>
  acceptIncoming: () => Promise<void>
  rejectIncoming: () => void
  endActive: () => void
  toggleMic: () => void
  toggleCamera: () => void
  toggleScreenShare: () => Promise<void>
  handleSignal: (peerId: string, signal: CallSignal) => void
  handlePeerDisconnected: (peerId: string) => void
  subscribe: (listener: () => void) => () => void
  getLocalStream: () => MediaStream | null
  getRemoteStream: () => MediaStream | null
}
