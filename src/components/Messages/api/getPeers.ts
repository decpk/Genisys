import type { MsgPeer } from '@/components/Messages/Messages.types'

export async function getPeers(): Promise<MsgPeer[]> {
  return window.api.msgGetPeers()
}
