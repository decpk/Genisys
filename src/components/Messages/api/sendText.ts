import type { MsgEnvelope } from '@/components/Messages/Messages.types'

export async function sendText(
  peerId: string,
  text: string
): Promise<MsgEnvelope> {
  return window.api.msgSendText(peerId, text)
}
