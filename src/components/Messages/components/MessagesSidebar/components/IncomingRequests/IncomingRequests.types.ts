import type { MsgRequest } from '@/components/Messages/Messages.types'

export interface IncomingRequestsData {
  requests: MsgRequest[]
  handleAccept: (peerId: string) => void
  handleReject: (peerId: string) => void
}
