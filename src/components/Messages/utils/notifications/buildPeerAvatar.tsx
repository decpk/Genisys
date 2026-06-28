import { Identicon } from '@/components/Messages/components/Identicon'
import type { MsgPeer } from '@/components/Messages/Messages.types'

/** Builds the avatar node shown in an incoming-message notification. */
export function buildPeerAvatar(peer: MsgPeer | undefined, peerId: string): React.ReactNode {
  const seed = peer?.publicKey || peerId
  return <Identicon seed={seed} size={36} />
}
