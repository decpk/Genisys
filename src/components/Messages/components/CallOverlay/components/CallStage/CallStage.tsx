import { Identicon } from '@/components/Messages/components/Identicon'

import { callStageStyles as s } from './CallStage.styles'
import type { CallStageProps } from './CallStage.types'
import { useCallStageData } from './useCallStageData'

export function CallStage(props: CallStageProps): React.JSX.Element {
  const { call, peer, localStream, remoteStream } = props
  const { isVideo, localVideoRef, remoteVideoRef, peerSeed, peerName } = useCallStageData({
    call,
    peer,
    localStream,
    remoteStream,
  })

  let content = (
    <div className={s.audioStage}>
      <Identicon seed={peerSeed} size={128} />
      <span className={s.audioName}>{peerName}</span>
    </div>
  )
  if (isVideo) {
    content = (
      <>
        <video ref={remoteVideoRef} className={s.remoteVideo} autoPlay playsInline />
        <video ref={localVideoRef} className={s.localVideo} autoPlay muted playsInline />
      </>
    )
  }

  return <div className={s.root}>{content}</div>
}
