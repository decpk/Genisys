import { useMessagesStore } from '@/store/messages-store'

import type { CallControllerContext } from '../call-controller.types'
import { stopRing } from './stopRing'
import { endActiveAction } from './endActive'

/**
 * Reacts to RTCPeerConnection connection-state changes:
 * - 'connected'   → mark the call active + stop any ring.
 * - 'failed'/'disconnected' → end the call via the single teardown path.
 */
export function handleConnectionState(
  ctx: CallControllerContext,
  state: RTCPeerConnectionState
): void {
  if (state === 'connected') {
    useMessagesStore.getState().setCallActive()
    useMessagesStore.getState().setCallStatus('active')
    stopRing(ctx)
    return
  }
  if (state === 'failed' || state === 'disconnected') {
    endActiveAction(ctx)
  }
}
