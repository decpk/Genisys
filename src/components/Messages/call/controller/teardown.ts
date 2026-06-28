import type { CallControllerContext } from '../call-controller.types'
import { stopRing } from './stopRing'
import { notifyListeners } from './notifyListeners'

/**
 * The single cleanup path. EVERY terminal transition (reject / end / busy /
 * fail / disconnect / timeout / unmount) routes through here so devices are
 * always released (camera light off, mic freed) and no orphaned ring/timer is
 * left behind. `PeerCall.close()` stops the local + screen tracks.
 */
export function teardown(ctx: CallControllerContext): void {
  stopRing(ctx)
  ctx.peerCall?.close()
  ctx.peerCall = null
  ctx.localStream = null
  ctx.remoteStream = null
  ctx.pendingRemoteIce = []
  ctx.remoteFingerprint = null
  notifyListeners(ctx)
}
