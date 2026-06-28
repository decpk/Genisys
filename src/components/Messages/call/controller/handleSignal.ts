import { scopedToast } from '@/frameworks/notification'

const toast = scopedToast('messages')

import { useMessagesStore } from '@/store/messages-store'
import { notifyMissedCall } from '@/components/Messages/utils/notifications'
import type { CallSignal } from '@/components/Messages/Messages.types'

import type { CallControllerContext } from '../call-controller.types'
import { handleCallRequest } from './handleCallRequest'
import { handleAccept } from './handleAccept'
import { applyOffer } from './applyOffer'
import { applyAnswer } from './applyAnswer'
import { addRemoteIce } from './addRemoteIce'
import { teardown } from './teardown'

/**
 * Routes a validated, parsed CallSignal to the right controller action.
 *
 * 'call-request' is allowed at any time (it starts a new incoming call). Every
 * other signal is dropped unless it belongs to the currently active call's peer
 * — this ignores cross-talk and stale signals (defense-in-depth alongside the
 * already-E2E channel).
 */
export function handleSignalAction(
  ctx: CallControllerContext,
  peerId: string,
  signal: CallSignal
): void {
  if (signal.t === 'call-request') {
    handleCallRequest(ctx, peerId, signal.kind)
    return
  }

  const activePeerId = useMessagesStore.getState().call?.peerId
  if (activePeerId !== peerId) return

  switch (signal.t) {
    case 'accept':
      void handleAccept(ctx, peerId)
      return
    case 'reject':
      toast.info('Call declined')
      useMessagesStore.getState().endCall()
      teardown(ctx)
      return
    case 'busy':
      toast.info('Peer is busy')
      useMessagesStore.getState().endCall()
      teardown(ctx)
      return
    case 'cancel': {
      const state = useMessagesStore.getState()
      const kind = state.incomingCall?.kind ?? state.call?.kind ?? 'audio'
      const peer = state.connectedPeers[peerId]
      state.endCall()
      teardown(ctx)
      notifyMissedCall(peer, peerId, kind)
      return
    }
    case 'end':
      useMessagesStore.getState().endCall()
      teardown(ctx)
      return
    case 'offer':
      void applyOffer(ctx, peerId, signal.sdp)
      return
    case 'answer':
      void applyAnswer(ctx, signal.sdp)
      return
    case 'candidate':
      void addRemoteIce(ctx, signal)
      return
    case 'media-state':
      // No-op for now — remote media flags are not tracked yet (Phase 6).
      return
    default:
      return
  }
}
