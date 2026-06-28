import { useMessagesStore } from '@/store/messages-store'

import type { CallControllerContext } from '../call-controller.types'
import { sendSignal } from '../../api/sendSignal'
import { extractDtlsFingerprint } from '../utils/extractDtlsFingerprint'
import { flushPendingIce } from './flushPendingIce'
import { endActiveAction } from './endActive'

/**
 * We are the callee and have already accepted: apply the remote offer, record
 * its DTLS fingerprint (signaled over the Noise-authenticated channel for
 * anti-MITM verification), flush any buffered ICE, then create and send the
 * answer.
 */
export async function applyOffer(
  ctx: CallControllerContext,
  peerId: string,
  sdp: string
): Promise<void> {
  if (!ctx.peerCall) return
  try {
    await ctx.peerCall.acceptOffer(sdp)
    ctx.remoteFingerprint = extractDtlsFingerprint(sdp)
    await flushPendingIce(ctx)
    const answer = await ctx.peerCall.createAnswer()
    await sendSignal(peerId, { t: 'answer', sdp: answer })
    useMessagesStore.getState().setCallStatus('connecting')
  } catch {
    endActiveAction(ctx)
  }
}
