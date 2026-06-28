import type { MsgPeer } from '@/components/Messages/Messages.types'

export type PeerListItemVariant = 'discovered' | 'conversation'

export interface PeerListItemProps {
  peer: MsgPeer
  variant: PeerListItemVariant
}

export interface PeerListItemData {
  isActive: boolean
  isConnecting: boolean
  handleSelect: () => void
  handleConnect: () => void
  handleDeleteConversation: () => void
  preview: string | null
  timeLabel: string | null
  unreadCount: number
}
