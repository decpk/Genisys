import type { CallControllerContext } from '../call-controller.types'
import type { IceSignal } from '@/components/Messages/Messages.types'

/**
 * Adds a remote ICE candidate if the remote description is already set,
 * otherwise buffers it in `ctx.pendingRemoteIce` to be flushed later.
 *
 * `addIceCandidate` rejects (InvalidStateError) when no remote description
 * exists yet, so we optimistically apply and buffer on failure — this avoids
 * reaching into PeerCall's private RTCPeerConnection while still honoring the
 * "buffer until remoteDescription" contract.
 */
export async function addRemoteIce(
  ctx: CallControllerContext,
  sig: IceSignal
): Promise<void> {
  if (!ctx.peerCall) {
    ctx.pendingRemoteIce.push(sig)
    return
  }
  try {
    await ctx.peerCall.addIce(sig)
  } catch {
    ctx.pendingRemoteIce.push(sig)
  }
}
