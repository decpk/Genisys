import { useEffect, useRef } from 'react'

import type { CallStageData, CallStageProps } from './CallStage.types'

export function useCallStageData(props: CallStageProps): CallStageData {
  const { call, peer, localStream, remoteStream } = props
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (localVideoRef.current) localVideoRef.current.srcObject = localStream
  }, [localStream])

  useEffect(() => {
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream
  }, [remoteStream])

  const isVideo = call.kind === 'video'
  const peerSeed = peer?.publicKey || peer?.id || call.peerId
  const peerName = peer?.displayName ?? 'Unknown peer'

  return { isVideo, localVideoRef, remoteVideoRef, peerSeed, peerName }
}
