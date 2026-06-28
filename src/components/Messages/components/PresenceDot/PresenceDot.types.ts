import type { MsgPeerStatus } from '@/components/Messages/Messages.types'

/** Peer statuses plus the local-only `offline` (invisible) state. */
export type PresenceStatus = MsgPeerStatus | 'offline'

export interface PresenceDotProps {
  status: PresenceStatus
  size?: number
  className?: string
}
