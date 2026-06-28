import { useCallback, useMemo } from 'react'
import { scopedToast } from '@/frameworks/notification'

const toast = scopedToast('messages')

import { acceptRequest } from '@/components/Messages/api/acceptRequest'
import { rejectRequest } from '@/components/Messages/api/rejectRequest'
import { useMessagesStore } from '@/store/messages-store'

import type { IncomingRequestsData } from './IncomingRequests.types'

export function useIncomingRequestsData(): IncomingRequestsData {
  const incomingRequests = useMessagesStore((s) => s.incomingRequests)
  const removeRequest = useMessagesStore((s) => s.removeRequest)
  const setActivePeer = useMessagesStore((s) => s.setActivePeer)

  const requests = useMemo(
    () => Object.values(incomingRequests),
    [incomingRequests]
  )

  const handleAccept = useCallback(
    (peerId: string) => {
      acceptRequest(peerId)
        .then(() => {
          removeRequest(peerId)
          setActivePeer(peerId)
        })
        .catch((e) => {
          const message = e instanceof Error ? e.message : String(e)
          toast.error(`Couldn't accept request: ${message}`)
        })
    },
    [removeRequest, setActivePeer]
  )

  const handleReject = useCallback(
    (peerId: string) => {
      rejectRequest(peerId)
        .then(() => removeRequest(peerId))
        .catch((e) => {
          const message = e instanceof Error ? e.message : String(e)
          toast.error(`Couldn't reject request: ${message}`)
        })
    },
    [removeRequest]
  )

  return { requests, handleAccept, handleReject }
}
