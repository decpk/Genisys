import type { ControlMessage } from '@/components/Messages/Messages.types'

import { encodeControl } from '../utils/encodeControl'

/** Relays an opaque app-control message (reaction / disappearing-timer) to a
 * peer over the same Noise-encrypted channel used for messages. */
export async function sendControl(
  peerId: string,
  message: ControlMessage
): Promise<void> {
  return window.api.msgSendControl(peerId, encodeControl(message))
}
