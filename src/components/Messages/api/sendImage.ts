import type { MsgEnvelope } from '@/components/Messages/Messages.types'

export async function sendImage(args: {
  peerId: string
  dataBase64: string
  mimeType: string
  fileName?: string
}): Promise<MsgEnvelope> {
  return window.api.msgSendImage(args)
}
