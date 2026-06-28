import { useCallback } from 'react'

import { callController } from '@/components/Messages/call/callController'
import type { CallKind } from '@/components/Messages/Messages.types'
import { useMessagesStore } from '@/store/messages-store'

import type { IncomingCallPromptData } from './IncomingCallPrompt.types'

const KIND_LABELS: Record<CallKind, string> = {
  audio: 'Incoming audio call',
  video: 'Incoming video call',
}

export function useIncomingCallPromptData(): IncomingCallPromptData {
  const incomingCall = useMessagesStore((s) => s.incomingCall)
  const peer = useMessagesStore((s) =>
    s.incomingCall ? s.connectedPeers[s.incomingCall.peerId] : undefined,
  )

  const open = incomingCall !== null
  const kind = incomingCall?.kind ?? 'audio'
  const kindLabel = KIND_LABELS[kind]
  const peerName = peer?.displayName ?? 'Unknown caller'
  const peerSeed = peer?.publicKey || peer?.id || incomingCall?.peerId || 'unknown'

  const accept = useCallback(() => {
    void callController.acceptIncoming()
  }, [])
  const decline = useCallback(() => {
    callController.rejectIncoming()
  }, [])

  return { open, kind, kindLabel, peerSeed, peerName, accept, decline }
}
