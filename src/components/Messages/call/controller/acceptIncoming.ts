import { useMessagesStore } from '@/store/messages-store'

import type { CallControllerContext } from '../call-controller.types'
import { sendSignal } from '../../api/sendSignal'
import { createCallPeer } from './createCallPeer'
import { stopRing } from './stopRing'
import { notifyListeners } from './notifyListeners'
import { endActiveAction } from './endActive'
import { notifyCallMediaError } from '../utils/notifyCallMediaError'

/**
 * Accepts the current incoming call: stop the ring, acquire local media, signal
 * 'accept' to the caller and move to 'connecting'. The SDP offer arrives next
 * over the signal channel and is handled by `applyOffer`.
 *
 * Single-call guard: aborts if a peer connection already exists.
 */
export async function acceptIncomingAction(
  ctx: CallControllerContext
): Promise<void> {
  const incoming = useMessagesStore.getState().incomingCall
  if (!incoming) return
  if (ctx.peerCall) return

  stopRing(ctx)
  ctx.peerCall = createCallPeer(ctx, incoming.peerId)

  try {
    ctx.localStream = await ctx.peerCall.start(incoming.kind)
    notifyListeners(ctx)
    await sendSignal(incoming.peerId, { t: 'accept' })
    useMessagesStore.getState().setIncomingCall(null)
    useMessagesStore.getState().setCallStatus('connecting')
  } catch (err) {
    notifyCallMediaError(err, incoming.kind, 'join')
    endActiveAction(ctx)
  }
}
