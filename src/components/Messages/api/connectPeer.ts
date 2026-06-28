import type { MsgPeer } from '@/components/Messages/Messages.types'

export async function connectPeer(args: {
  peerId?: string
  host?: string
  port?: number
}): Promise<MsgPeer> {
  return window.api.msgConnect(args)
}
