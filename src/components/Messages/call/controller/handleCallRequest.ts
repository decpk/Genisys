import { useMessagesStore } from '@/store/messages-store'
import {
  notifyIncomingCall,
  notifyMissedCall,
} from '@/components/Messages/utils/notifications'
import type { CallKind } from '@/components/Messages/Messages.types'

import type { CallControllerContext } from '../call-controller.types'
import { sendSignal } from '../../api/sendSignal'
import { startRing } from './startRing'

/**
 * Handles an incoming 'call-request'. Single-call guard: if we are already in a
 * call we reply 'busy' and record a missed call; otherwise we surface the
 * incoming call in the store, raise the OS/history notification and start
 * ringing.
 */
export function handleCallRequest(
  ctx: CallControllerContext,
  peerId: string,
  kind: CallKind
): void {
  const state = useMessagesStore.getState()
  const peer = state.connectedPeers[peerId]

  if (state.call) {
    void sendSignal(peerId, { t: 'busy' }).catch(() => {})
    notifyMissedCall(peer, peerId, kind)
    return
  }

  state.setIncomingCall({ peerId, kind })
  notifyIncomingCall(peer, peerId, kind)
  startRing(ctx, peerId)
}
