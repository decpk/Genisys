import type { MsgPeer } from '@/components/Messages/Messages.types'

export interface MessagesSidebarData {
  discovered: MsgPeer[]
  connected: MsgPeer[]
  searchQuery: string
  setSearchQuery: (value: string) => void
}
