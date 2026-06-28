import { useCallback, useState } from 'react'

import { connectPeer } from '@/components/Messages/api/connectPeer'
import type { MsgPeer } from '@/components/Messages/Messages.types'
import { formatRelativeTime } from '@/components/Messages/utils/formatRelativeTime'
import { getMessagePreview } from '@/components/Messages/utils/getMessagePreview'
import { useConfirmDialogStore } from '@/store/confirm-dialog-store'
import { useMessagesStore } from '@/store/messages-store'
import { EMPTY_MESSAGES } from '@/store/messages-store/messages-store.constants'

import type { PeerListItemData } from './PeerListItem.types'

export function usePeerListItemData(peer: MsgPeer): PeerListItemData {
  const activePeerId = useMessagesStore((s) => s.activePeerId)
  const setActivePeer = useMessagesStore((s) => s.setActivePeer)
  const upsertPeer = useMessagesStore((s) => s.upsertPeer)
  const messages = useMessagesStore((s) => s.messages)
  const removeConversation = useMessagesStore((s) => s.removeConversation)
  const openConfirmDialog = useConfirmDialogStore((s) => s.openConfirmDialog)
  const unreadByPeer = useMessagesStore((s) => s.unreadByPeer)

  const [isConnecting, setIsConnecting] = useState(false)

  const handleSelect = useCallback(() => {
    setActivePeer(peer.id)
  }, [peer.id, setActivePeer])

  const handleConnect = useCallback(async () => {
    setIsConnecting(true)
    try {
      const connected = await connectPeer({ peerId: peer.id })
      upsertPeer(connected)
      setActivePeer(connected.id)
    } catch (e) {
      console.error('[messages] failed to connect to peer:', e)
    } finally {
      setIsConnecting(false)
    }
  }, [peer.id, upsertPeer, setActivePeer])

  const handleDeleteConversation = useCallback(() => {
    openConfirmDialog({
      title: 'Delete conversation',
      description: `Delete your conversation with "${peer.displayName}"? This clears the message history and cannot be undone.`,
      onConfirm: () => removeConversation(peer.id),
    })
  }, [openConfirmDialog, removeConversation, peer.displayName, peer.id])

  const peerMessages = messages[peer.id] ?? EMPTY_MESSAGES
  const last =
    peerMessages.length > 0 ? peerMessages[peerMessages.length - 1] : null

  let preview: string | null = null
  let timeLabel: string | null = null
  if (last) {
    preview = getMessagePreview(last)
    timeLabel = formatRelativeTime(last.timestamp)
  }

  const unreadCount = unreadByPeer[peer.id] ?? 0

  return {
    isActive: activePeerId === peer.id,
    isConnecting,
    handleSelect,
    handleConnect,
    handleDeleteConversation,
    preview,
    timeLabel,
    unreadCount,
  }
}
