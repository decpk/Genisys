import { shouldSuppressForDnd } from '@/frameworks/notification/dnd'

import type { CallControllerContext } from '../call-controller.types'
import { CALL_RINGBACK_SRC } from '../call-controller.constants'

/**
 * Plays the outgoing ringback tone in a loop while we wait for the callee to
 * answer. Do-Not-Disturb gates ONLY the audio — the call state/visibility is
 * never suppressed.
 */
export function playRingback(ctx: CallControllerContext): void {
  if (shouldSuppressForDnd()) return
  const audio = new Audio(CALL_RINGBACK_SRC)
  audio.loop = true
  audio.volume = 1
  void audio.play().catch(() => {})
  ctx.ringbackAudio = audio
}
