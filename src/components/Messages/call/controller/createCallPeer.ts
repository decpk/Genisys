import type { CallControllerContext } from '../call-controller.types'
import { PeerCall } from '../PeerCall'
import { sendSignal } from '../../api/sendSignal'
import { notifyListeners } from './notifyListeners'
import { handleConnectionState } from './handleConnectionState'

/**
 * Builds a PeerCall wired to this controller's context. Shared by the outgoing
 * (startCall) and incoming (acceptIncoming) flows so both use identical
 * callbacks: relay ICE over the encrypted channel, surface the remote stream to
 * UI subscribers, and drive call state off the connection state.
 */
export function createCallPeer(
  ctx: CallControllerContext,
  peerId: string
): PeerCall {
  return new PeerCall({
    onIceCandidate: (candidate) => {
      void sendSignal(peerId, {
        t: 'candidate',
        candidate: candidate.candidate,
        sdpMid: candidate.sdpMid,
        sdpMLineIndex: candidate.sdpMLineIndex,
      }).catch(() => {})
    },
    onRemoteStream: (stream) => {
      ctx.remoteStream = stream
      notifyListeners(ctx)
    },
    onConnectionStateChange: (state) => {
      handleConnectionState(ctx, state)
    },
  })
}
