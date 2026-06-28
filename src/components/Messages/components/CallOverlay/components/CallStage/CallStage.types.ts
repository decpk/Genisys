import type { RefObject } from 'react'

import type { ActiveCall, MsgPeer } from '@/components/Messages/Messages.types'

export interface CallStageProps {
  call: ActiveCall
  peer: MsgPeer | undefined
  localStream: MediaStream | null
  remoteStream: MediaStream | null
}

export interface CallStageData {
  isVideo: boolean
  localVideoRef: RefObject<HTMLVideoElement | null>
  remoteVideoRef: RefObject<HTMLVideoElement | null>
  peerSeed: string
  peerName: string
}
