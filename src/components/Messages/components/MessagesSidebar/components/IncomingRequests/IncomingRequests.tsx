import { BellRing, Check, X } from 'lucide-react'

import { Identicon } from '@/components/Messages/components/Identicon'
import { formatFingerprint } from '@/components/Messages/utils/formatFingerprint'

import { incomingRequestsStyles as s } from './IncomingRequests.styles'
import { useIncomingRequestsData } from './useIncomingRequestsData'

export function IncomingRequests(): React.JSX.Element | null {
  const { requests, handleAccept, handleReject } = useIncomingRequestsData()

  if (requests.length === 0) return null

  return (
    <div className={s.root}>
      <div className={s.header}>
        <BellRing className={s.headerIcon} />
        <span>Chat requests</span>
      </div>
      <div className={s.list}>
        {requests.map((request) => {
          const shortId = formatFingerprint(request.fingerprint)
            .split(' ')
            .slice(0, 3)
            .join(' ')
          return (
            <div key={request.peerId} className={s.card}>
              <div className={s.avatar}>
                <Identicon seed={request.fingerprint} size={36} />
              </div>
              <div className={s.info}>
                <div className={s.name}>{request.displayName}</div>
                <div className={s.meta}>{shortId}</div>
              </div>
              <div className={s.actions}>
                <button
                  type="button"
                  className={s.accept}
                  onClick={() => handleAccept(request.peerId)}
                  aria-label={`Accept chat request from ${request.displayName}`}
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className={s.reject}
                  onClick={() => handleReject(request.peerId)}
                  aria-label={`Reject chat request from ${request.displayName}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
