import type { CallSignal } from '@/components/Messages/Messages.types'
import { encodeSignal } from '../call/utils/encodeSignal'

/** Relays an opaque call signal to a peer over the encrypted messaging channel. */
export async function sendSignal(
  peerId: string,
  signal: CallSignal
): Promise<void> {
  return window.api.msgSendSignal(peerId, encodeSignal(signal))
}
