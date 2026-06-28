import { scopedToast } from '@/frameworks/notification'

const toast = scopedToast('messages')

import { useMessagesStore } from '@/store/messages-store'

import type { CallControllerContext } from '../call-controller.types'
import { sendSignal } from '../../api/sendSignal'

/**
 * Starts or stops screen sharing and reflects the new flag in the store + peer.
 *
 * NOTE: When the user stops sharing via the OS picker, PeerCall reverts to the
 * camera track internally but cannot surface that auto-end here; the store flag
 * then corrects itself on the next toggle.
 * TODO: have PeerCall surface screen-track auto-end so the flag reverts live.
 */
export async function toggleScreenShareAction(
  ctx: CallControllerContext
): Promise<void> {
  const call = useMessagesStore.getState().call
  if (!call || !ctx.peerCall) return

  const sharingScreen = !call.sharingScreen
  try {
    if (sharingScreen) {
      await ctx.peerCall.startScreenShare()
    } else {
      await ctx.peerCall.stopScreenShare()
    }
  } catch {
    toast.error('Screen share failed')
    return
  }

  useMessagesStore.getState().updateCallFlags({ sharingScreen })
  const next = useMessagesStore.getState().call
  if (!next) return
  void sendSignal(call.peerId, {
    t: 'media-state',
    micOn: next.micOn,
    camOn: next.camOn,
    sharingScreen,
  }).catch(() => {})
}
