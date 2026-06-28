import type { CallControllerContext } from '../call-controller.types'

/**
 * Flushes every buffered remote ICE candidate into the peer connection and
 * clears the buffer. Called immediately after the remote description is applied
 * (offer on the callee, answer on the caller), since candidates can arrive
 * before the description is set.
 */
export async function flushPendingIce(ctx: CallControllerContext): Promise<void> {
  if (!ctx.peerCall) return
  const pending = ctx.pendingRemoteIce
  ctx.pendingRemoteIce = []
  for (const sig of pending) {
    try {
      await ctx.peerCall.addIce(sig)
    } catch {
      // Ignore individual bad/late candidates — LAN host candidates are plenty.
    }
  }
}
