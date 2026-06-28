import type { MsgPeer } from '@/components/Messages/Messages.types'
import type { ContentWidth } from '@/store/settings-store'

export interface ConversationHeaderProps {
  peer: MsgPeer
}

export interface ConversationHeaderData {
  rightPanelOpen: boolean
  toggleInfo: () => void
  contentWidth: ContentWidth
  setContentWidth: (width: ContentWidth) => void
}
