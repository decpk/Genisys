import { Lock } from 'lucide-react'

import { CallControlsBar } from './components/CallControlsBar'
import { CallStage } from './components/CallStage'
import { CallStatusLabel } from './components/CallStatusLabel'
import { callOverlayStyles as s } from './CallOverlay.styles'
import { useCallOverlayData } from './useCallOverlayData'

export function CallOverlay(): React.JSX.Element | null {
  const { visible, call, peer, localStream, remoteStream, handlers } = useCallOverlayData()

  if (!visible || !call) return null

  const peerName = peer?.displayName ?? 'Unknown peer'

  return (
    <div className={s.root}>
      <div className={s.topBar}>
        <span className={s.peerName}>{peerName}</span>
        <span className={s.pill}>
          <Lock className={s.pillIcon} />
          End-to-end encrypted
        </span>
      </div>
      <div className={s.center}>
        <CallStage call={call} peer={peer} localStream={localStream} remoteStream={remoteStream} />
        <CallStatusLabel status={call.status} startedAt={call.startedAt} />
      </div>
      <CallControlsBar call={call} handlers={handlers} />
    </div>
  )
}
