import type { MsgPeer } from '@/components/Messages/Messages.types'

export interface PeerInfoPanelData {
  peer: MsgPeer | null
  isVerifying: boolean
  fingerprint: string
  safetyNumber: string | null
  handleVerify: () => void
}
