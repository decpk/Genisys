import { Phone, Video } from 'lucide-react'
import { notify } from '@/frameworks/notification'
import type { CallKind, MsgPeer } from '@/components/Messages/Messages.types'
import { buildCallTitle } from './buildCallTitle'
import { buildPeerAvatar } from './buildPeerAvatar'

/**
 * Surfaces an incoming call on the OS/system channel and records it in
 * notification history. The persistent in-app ring (looping ringtone +
 * Accept/Decline modal) is owned separately by the call engine/modal; this
 * function only provides the background/OS surface so users not focused on the
 * app still see the call arrive.
 */
export function notifyIncomingCall(
  peer: MsgPeer | undefined,
  peerId: string,
  kind: CallKind
): void {
  const name = peer?.displayName ?? 'Unknown'
  const icon = kind === 'video' ? Video : Phone
  const avatar = buildPeerAvatar(peer, peerId)

  notify({
    source: 'messages',
    type: 'info',
    channel: 'os',
    title: buildCallTitle(kind, name),
    message: `${name} is calling…`,
    icon,
    avatar,
    meta: { peerId, kind },
  })
}
