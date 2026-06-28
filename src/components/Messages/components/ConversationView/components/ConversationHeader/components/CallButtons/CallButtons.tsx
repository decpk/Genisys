import { Phone, Video } from 'lucide-react'

import { Tooltip } from '@/components/Tooltip'

import { callButtonsStyles as s } from './CallButtons.styles'
import type { CallButtonsProps } from './CallButtons.types'
import { useCallButtonsData } from './useCallButtonsData'

export function CallButtons(props: CallButtonsProps): React.JSX.Element {
  const { peer } = props
  const { canCall, callActive, startAudio, startVideo } = useCallButtonsData(peer)
  const disabled = !canCall || callActive

  let audioTitle = 'Start audio call'
  let videoTitle = 'Start video call'
  if (!canCall) {
    audioTitle = 'Connect to start audio call'
    videoTitle = 'Connect to start video call'
  }
  if (callActive) {
    audioTitle = 'Audio call unavailable — call in progress'
    videoTitle = 'Video call unavailable — call in progress'
  }

  return (
    <>
      <Tooltip content={audioTitle} side="bottom">
        <button
          type="button"
          className={s.button}
          onClick={startAudio}
          disabled={disabled}
          aria-label="Start audio call"
        >
          <Phone className="h-3.5 w-3.5" />
        </button>
      </Tooltip>
      <Tooltip content={videoTitle} side="bottom">
        <button
          type="button"
          className={s.button}
          onClick={startVideo}
          disabled={disabled}
          aria-label="Start video call"
        >
          <Video className="h-3.5 w-3.5" />
        </button>
      </Tooltip>
    </>
  )
}
