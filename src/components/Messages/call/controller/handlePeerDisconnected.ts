import { scopedToast } from '@/frameworks/notification'

const toast = scopedToast('messages')

import { useMessagesStore } from '@/store/messages-store'

import type { CallControllerContext } from '../call-controller.types'
import { teardown } from './teardown'

/**
 * Auto-ends an active call when the peer disconnects from the mesh, releasing
 * all devices via the single teardown path. Ignored when no call with that peer
 * is active.
 */
export function handlePeerDisconnectedAction(
  ctx: CallControllerContext,
  peerId: string
): void {
  const call = useMessagesStore.getState().call
  if (call?.peerId !== peerId) return
  toast.info('Call ended — peer disconnected')
  useMessagesStore.getState().endCall()
  teardown(ctx)
}
