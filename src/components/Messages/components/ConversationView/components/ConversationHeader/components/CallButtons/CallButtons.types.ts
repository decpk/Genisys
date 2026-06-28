import type { MsgPeer } from '@/components/Messages/Messages.types'

export interface CallButtonsProps {
  peer: MsgPeer
}

export interface CallButtonsData {
  canCall: boolean
  callActive: boolean
  startAudio: () => void
  startVideo: () => void
}
