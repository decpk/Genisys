import type { LucideIcon } from 'lucide-react'

import type { MsgPeer } from '@/components/Messages/Messages.types'
import type { PeerListItemVariant } from '@/components/Messages/components/MessagesSidebar/components/PeerListItem/PeerListItem.types'

export interface PeerSectionProps {
  title: string
  icon: LucideIcon
  peers: MsgPeer[]
  variant: PeerListItemVariant
  emptyLabel: string
}
