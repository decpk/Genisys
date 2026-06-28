import { scopedToast } from '@/frameworks/notification'

const toast = scopedToast('messages')

import { useMessagesStore } from '@/store/messages-store'
import type { CallKind } from '@/components/Messages/Messages.types'

import type { CallControllerContext } from '../call-controller.types'
import { sendSignal } from '../../api/sendSignal'
import { createCallPeer } from './createCallPeer'
import { notifyListeners } from './notifyListeners'
import { playRingback } from './playRingback'
import { endActiveAction } from './endActive'
import { notifyCallMediaError } from '../utils/notifyCallMediaError'

/**
 * Places an outgoing call. Single-call guard: aborts if a different call is
 * already active or a peer connection already exists. Acquires local media,
 * starts the ringback tone, then asks the peer to ring via 'call-request'.
 */
export async function startCallAction(
  ctx: CallControllerContext,
  peerId: string,
  kind: CallKind
): Promise<void> {
  const state = useMessagesStore.getState()
  if (state.call && state.call.peerId !== peerId) {
    toast.error('You are already in a call')
    return
  }
  if (ctx.peerCall) return

  state.startOutgoingCall(peerId, kind)
  ctx.peerCall = createCallPeer(ctx, peerId)

  try {
    ctx.localStream = await ctx.peerCall.start(kind)
    notifyListeners(ctx)
    playRingback(ctx)
    await sendSignal(peerId, { t: 'call-request', kind })
    useMessagesStore.getState().setCallStatus('outgoing')
  } catch (err) {
    notifyCallMediaError(err, kind, 'start')
    endActiveAction(ctx)
  }
}
