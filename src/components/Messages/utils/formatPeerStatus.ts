import type { MsgPeerStatus } from '@/components/Messages/Messages.types'

const STATUS_LABELS: Record<MsgPeerStatus, string> = {
  connected: 'Connected',
  connecting: 'Connecting…',
  pending: 'Waiting to accept…',
  discovered: 'Discovered',
  disconnected: 'Disconnected',
}

// Human-readable label for a peer connection status.
export function formatPeerStatus(status: MsgPeerStatus): string {
  return STATUS_LABELS[status]
}
