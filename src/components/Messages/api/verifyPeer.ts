import type { MsgPeer } from '@/components/Messages/Messages.types'

export async function verifyPeer(peerId: string): Promise<MsgPeer> {
  return window.api.msgVerifyPeer(peerId)
}
