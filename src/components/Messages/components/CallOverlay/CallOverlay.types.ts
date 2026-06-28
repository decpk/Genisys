import type { ActiveCall, MsgPeer } from '@/components/Messages/Messages.types'

export interface CallControlHandlers {
  toggleMic: () => void
  toggleCamera: () => void
  toggleScreenShare: () => void
  endCall: () => void
}

export interface CallOverlayData {
  visible: boolean
  call: ActiveCall | null
  peer: MsgPeer | undefined
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  handlers: CallControlHandlers
}
