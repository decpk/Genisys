import { PhoneMissed } from 'lucide-react'
import { notify } from '@/frameworks/notification'
import type { CallKind, MsgPeer } from '@/components/Messages/Messages.types'
import { buildPeerAvatar } from './buildPeerAvatar'
import { openPeerConversation } from './openPeerConversation'

/**
 * Records a missed call (timeout / busy / remote reject) as a persistent
 * warning notification with a "Call back" action that reopens the conversation.
 */
export function notifyMissedCall(
  peer: MsgPeer | undefined,
  peerId: string,
  kind: CallKind
): void {
  const name = peer?.displayName ?? 'Unknown'
  const avatar = buildPeerAvatar(peer, peerId)

  notify({
    source: 'messages',
    type: 'warning',
    channel: 'app',
    title: `Missed ${kind} call`,
    message: `Missed ${kind} call from ${name}`,
    icon: PhoneMissed,
    avatar,
    duration: Infinity,
    actions: [
      { label: 'Call back', onClick: () => openPeerConversation(peerId) },
    ],
    meta: { peerId, kind },
  })
}
