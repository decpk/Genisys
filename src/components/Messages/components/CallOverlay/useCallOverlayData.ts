import { useEffect, useMemo, useReducer } from 'react'

import { callController } from '@/components/Messages/call/callController'
import type { CallStatus } from '@/components/Messages/Messages.types'
import { useMessagesStore } from '@/store/messages-store'

import type { CallControlHandlers, CallOverlayData } from './CallOverlay.types'

const VISIBLE_STATUSES: CallStatus[] = ['outgoing', 'connecting', 'active']

export function useCallOverlayData(): CallOverlayData {
  const [, force] = useReducer((n: number) => n + 1, 0)
  useEffect(() => callController.subscribe(force), [])

  const call = useMessagesStore((s) => s.call)
  const peer = useMessagesStore((s) => (s.call ? s.connectedPeers[s.call.peerId] : undefined))

  const localStream = callController.getLocalStream()
  const remoteStream = callController.getRemoteStream()

  const handlers = useMemo<CallControlHandlers>(
    () => ({
      toggleMic: () => callController.toggleMic(),
      toggleCamera: () => callController.toggleCamera(),
      toggleScreenShare: () => {
        void callController.toggleScreenShare()
      },
      endCall: () => callController.endActive(),
    }),
    [],
  )

  const visible = call !== null && VISIBLE_STATUSES.includes(call.status)

  return { visible, call, peer, localStream, remoteStream, handlers }
}
