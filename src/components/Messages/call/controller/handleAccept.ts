import { useMessagesStore } from '@/store/messages-store'

import type { CallControllerContext } from '../call-controller.types'
import { sendSignal } from '../../api/sendSignal'
import { stopRing } from './stopRing'
import { endActiveAction } from './endActive'

/**
 * The remote peer accepted our outgoing call. Stop the ringback, move to
 * 'connecting', and create + send the SDP offer. The caller's DTLS fingerprint
 * is verified later when the answer arrives (we have nothing to compare against
 * yet, so reset it to null).
 */
export async function handleAccept(
  ctx: CallControllerContext,
  peerId: string
): Promise<void> {
  if (!ctx.peerCall) return
  stopRing(ctx)
  useMessagesStore.getState().setCallStatus('connecting')
  ctx.remoteFingerprint = null
  try {
    const sdp = await ctx.peerCall.createOffer()
    await sendSignal(peerId, { t: 'offer', sdp })
  } catch {
    endActiveAction(ctx)
  }
}
