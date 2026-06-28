import { scopedToast } from '@/frameworks/notification'

const toast = scopedToast('messages')

import type { CallControllerContext } from '../call-controller.types'

/**
 * Stops and clears every ring artifact: the incoming ringtone, the outgoing
 * ringback, the missed-call timeout and any associated toast. Safe to call
 * multiple times — it is part of the single teardown path.
 */
export function stopRing(ctx: CallControllerContext): void {
  if (ctx.ringAudio) {
    ctx.ringAudio.pause()
    ctx.ringAudio.currentTime = 0
    ctx.ringAudio = null
  }
  if (ctx.ringbackAudio) {
    ctx.ringbackAudio.pause()
    ctx.ringbackAudio.currentTime = 0
    ctx.ringbackAudio = null
  }
  if (ctx.ringTimeout) {
    clearTimeout(ctx.ringTimeout)
    ctx.ringTimeout = null
  }
  if (ctx.toastId) {
    toast.dismiss(ctx.toastId)
    ctx.toastId = null
  }
}
