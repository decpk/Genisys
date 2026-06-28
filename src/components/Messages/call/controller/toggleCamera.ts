import { useMessagesStore } from '@/store/messages-store'

import type { CallControllerContext } from '../call-controller.types'
import { sendSignal } from '../../api/sendSignal'

/** Toggles the local camera and tells the peer about the new media state. */
export function toggleCameraAction(ctx: CallControllerContext): void {
  const call = useMessagesStore.getState().call
  if (!call || !ctx.peerCall) return

  const camOn = !call.camOn
  useMessagesStore.getState().updateCallFlags({ camOn })
  void ctx.peerCall.toggleCamera(camOn)

  const next = useMessagesStore.getState().call
  if (!next) return
  void sendSignal(call.peerId, {
    t: 'media-state',
    micOn: next.micOn,
    camOn,
    sharingScreen: next.sharingScreen,
  }).catch(() => {})
}
