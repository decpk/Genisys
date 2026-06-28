import { useMessagesStore } from '@/store/messages-store'
import { notifyMissedCall } from '@/components/Messages/utils/notifications'
import { shouldSuppressForDnd } from '@/frameworks/notification/dnd'

import type { CallControllerContext } from '../call-controller.types'
import { CALL_RINGTONE_SRC, CALL_RING_TIMEOUT_MS } from '../call-controller.constants'
import { endActiveAction } from './endActive'

/**
 * Starts the persistent incoming ring. The actionable alert (Accept/Decline)
 * is driven by `store.incomingCall` + the modal, so this only plays the looping
 * ringtone and arms the missed-call timeout.
 *
 * Do-Not-Disturb gates ONLY the audio — the call stays fully visible/actionable
 * even while DND is on. After the timeout the unanswered call converts to a
 * persistent "missed call" notification and tears down.
 */
export function startRing(ctx: CallControllerContext, peerId: string): void {
  if (!shouldSuppressForDnd()) {
    const audio = new Audio(CALL_RINGTONE_SRC)
    audio.loop = true
    audio.volume = 1
    void audio.play().catch(() => {})
    ctx.ringAudio = audio
  }
  ctx.ringTimeout = setTimeout(() => {
    const state = useMessagesStore.getState()
    const kind = state.incomingCall?.kind ?? 'audio'
    const peer = state.connectedPeers[peerId]
    notifyMissedCall(peer, peerId, kind)
    endActiveAction(ctx)
  }, CALL_RING_TIMEOUT_MS)
}
