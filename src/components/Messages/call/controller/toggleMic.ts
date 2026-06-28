import { useMessagesStore } from '@/store/messages-store'

import type { CallControllerContext } from '../call-controller.types'
import { sendSignal } from '../../api/sendSignal'

/** Toggles the local microphone and tells the peer about the new media state. */
export function toggleMicAction(ctx: CallControllerContext): void {
  const call = useMessagesStore.getState().call
  if (!call || !ctx.peerCall) return

  const micOn = !call.micOn
  useMessagesStore.getState().updateCallFlags({ micOn })
  void ctx.peerCall.toggleMic(micOn)

  const next = useMessagesStore.getState().call
  if (!next) return
  void sendSignal(call.peerId, {
    t: 'media-state',
    micOn,
    camOn: next.camOn,
    sharingScreen: next.sharingScreen,
  }).catch(() => {})
}
