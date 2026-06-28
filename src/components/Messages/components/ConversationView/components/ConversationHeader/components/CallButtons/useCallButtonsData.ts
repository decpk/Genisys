import { useCallback } from 'react'

import { callController } from '@/components/Messages/call/callController'
import type { MsgPeer } from '@/components/Messages/Messages.types'
import { useMessagesStore } from '@/store/messages-store'

import type { CallButtonsData } from './CallButtons.types'

export function useCallButtonsData(peer: MsgPeer): CallButtonsData {
  const activeCall = useMessagesStore((s) => s.call)
  const canCall = peer.status === 'connected'
  const callActive = activeCall !== null

  const startAudio = useCallback(() => {
    void callController.startCall(peer.id, 'audio')
  }, [peer.id])

  const startVideo = useCallback(() => {
    void callController.startCall(peer.id, 'video')
  }, [peer.id])

  return { canCall, callActive, startAudio, startVideo }
}
