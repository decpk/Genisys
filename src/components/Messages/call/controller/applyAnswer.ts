import { scopedToast } from '@/frameworks/notification'

const toast = scopedToast('messages')

import { useMessagesStore } from '@/store/messages-store'

import type { CallControllerContext } from '../call-controller.types'
import { verifyDtlsFingerprint } from '../utils/verifyDtlsFingerprint'
import { flushPendingIce } from './flushPendingIce'
import { teardown } from './teardown'
import { endActiveAction } from './endActive'

/**
 * We are the caller and received the answer. Verify the answer's DTLS
 * fingerprint against the one expected over the trusted channel (anti-MITM); on
 * mismatch abort the whole call. Otherwise apply the answer and flush buffered
 * ICE.
 */
export async function applyAnswer(
  ctx: CallControllerContext,
  sdp: string
): Promise<void> {
  if (!ctx.peerCall) return
  if (!verifyDtlsFingerprint(sdp, ctx.remoteFingerprint)) {
    useMessagesStore.getState().endCall()
    teardown(ctx)
    toast.error('Call security check failed')
    return
  }
  try {
    await ctx.peerCall.acceptAnswer(sdp)
    await flushPendingIce(ctx)
  } catch {
    endActiveAction(ctx)
  }
}
