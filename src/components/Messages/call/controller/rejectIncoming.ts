import { useMessagesStore } from '@/store/messages-store'

import type { CallControllerContext } from '../call-controller.types'
import { sendSignal } from '../../api/sendSignal'
import { teardown } from './teardown'

/**
 * Declines the current incoming call: best-effort signals 'reject' to the
 * caller, clears the store call state and tears down to release any acquired
 * devices.
 */
export function rejectIncomingAction(ctx: CallControllerContext): void {
  const state = useMessagesStore.getState()
  const peerId = state.incomingCall?.peerId ?? state.call?.peerId
  if (peerId) {
    void sendSignal(peerId, { t: 'reject' }).catch(() => {})
  }
  state.endCall()
  teardown(ctx)
}
