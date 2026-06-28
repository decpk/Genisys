import { notify } from '@/frameworks/notification'
import type { Message, MsgPeer } from '@/components/Messages/Messages.types'
import { buildMessagePreview } from './buildMessagePreview'
import { buildPeerAvatar } from './buildPeerAvatar'
import { openPeerConversation } from './openPeerConversation'

/**
 * Shows a notification for an incoming message. Caller is responsible for only
 * invoking this when the message is incoming AND the user is not actively
 * viewing that conversation.
 *
 * When `windowFocused` is true the notification is delivered as an in-app toast
 * (clickable — opens the conversation). When the Genisys window is backgrounded it
 * is delivered as a native OS notification so it's visible outside the app.
 */
export function notifyIncomingMessage(
  message: Message,
  peer: MsgPeer | undefined,
  windowFocused: boolean,
): void {
  const title = peer?.displayName ?? 'New message'
  const preview = buildMessagePreview(message)
  const avatar = buildPeerAvatar(peer, message.peerId)

  notify({
    source: 'messages',
    type: 'info',
    channel: windowFocused ? 'app' : 'os',
    title,
    message: preview,
    avatar,
    onClick: () => openPeerConversation(message.peerId),
    meta: { peerId: message.peerId },
  })
}
