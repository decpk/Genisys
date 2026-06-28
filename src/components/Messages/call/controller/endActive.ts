import { useMessagesStore } from '@/store/messages-store'

import type { CallControllerContext } from '../call-controller.types'
import { sendSignal } from '../../api/sendSignal'
import { teardown } from './teardown'

/**
 * Ends the active call: best-effort signals the peer we hung up, clears the
 * store call state, and routes through the single teardown path to release all
 * devices. Used by every local terminal transition (end button, fatal ICE
 * state, ring timeout, unmount).
 */
export function endActiveAction(ctx: CallControllerContext): void {
  const peerId = useMessagesStore.getState().call?.peerId
  if (peerId) {
    void sendSignal(peerId, { t: 'end' }).catch(() => {})
  }
  useMessagesStore.getState().endCall()
  teardown(ctx)
}
