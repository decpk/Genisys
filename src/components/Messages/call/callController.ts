import type {
  CallControllerApi,
  CallControllerContext,
} from './call-controller.types'
import { startCallAction } from './controller/startCall'
import { acceptIncomingAction } from './controller/acceptIncoming'
import { rejectIncomingAction } from './controller/rejectIncoming'
import { endActiveAction } from './controller/endActive'
import { toggleMicAction } from './controller/toggleMic'
import { toggleCameraAction } from './controller/toggleCamera'
import { toggleScreenShareAction } from './controller/toggleScreenShare'
import { handleSignalAction } from './controller/handleSignal'
import { handlePeerDisconnectedAction } from './controller/handlePeerDisconnected'

/**
 * The single, module-level call context. MediaStream / RTCPeerConnection live
 * here (never in the serializable zustand store). It is reset by `teardown` on
 * every terminal transition.
 */
const ctx: CallControllerContext = {
  peerCall: null,
  localStream: null,
  remoteStream: null,
  pendingRemoteIce: [],
  ringAudio: null,
  ringbackAudio: null,
  ringTimeout: null,
  toastId: null,
  remoteFingerprint: null,
  listeners: new Set(),
}

/**
 * Shared singleton the UI drives calls through. UI reads serializable call
 * state from the messages store, and gets the live MediaStreams by calling
 * `subscribe(cb)` (re-renders on change) + `getLocalStream` / `getRemoteStream`.
 */
export const callController: CallControllerApi = {
  startCall: (peerId, kind) => startCallAction(ctx, peerId, kind),
  acceptIncoming: () => acceptIncomingAction(ctx),
  rejectIncoming: () => rejectIncomingAction(ctx),
  endActive: () => endActiveAction(ctx),
  toggleMic: () => toggleMicAction(ctx),
  toggleCamera: () => toggleCameraAction(ctx),
  toggleScreenShare: () => toggleScreenShareAction(ctx),
  handleSignal: (peerId, signal) => handleSignalAction(ctx, peerId, signal),
  handlePeerDisconnected: (peerId) => handlePeerDisconnectedAction(ctx, peerId),
  subscribe: (listener) => {
    ctx.listeners.add(listener)
    return () => {
      ctx.listeners.delete(listener)
    }
  },
  getLocalStream: () => ctx.localStream,
  getRemoteStream: () => ctx.remoteStream,
}
