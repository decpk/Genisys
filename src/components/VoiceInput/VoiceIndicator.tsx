import { Square } from 'lucide-react'
import { cn } from '@/lib/utils'
import { VOICE_INDICATOR_STYLES } from './VoiceIndicator.styles'

interface VoiceIndicatorProps {
  isListening: boolean
  interimText: string
  audioLevel: number
  onStop: () => void
}

function VoiceIndicator(props: VoiceIndicatorProps) {
  const { isListening, interimText, audioLevel, onStop } = props

  if (!isListening) {
    return null
  }

  const levelWidth = `${Math.round(audioLevel * 100)}%`

  const hasInterimText = interimText.length > 0

  return (
    <div className={VOICE_INDICATOR_STYLES.wrapper}>
      <div className={VOICE_INDICATOR_STYLES.container}>
        <span className={VOICE_INDICATOR_STYLES.dot} />
        <span className={VOICE_INDICATOR_STYLES.label}>Listening…</span>

        {hasInterimText && (
          <span className={VOICE_INDICATOR_STYLES.interimText}>{interimText}</span>
        )}

        <div className={cn(VOICE_INDICATOR_STYLES.levelBar)} style={{ width: levelWidth }} />

        <button
          type="button"
          onClick={onStop}
          className={VOICE_INDICATOR_STYLES.stopButton}
        >
          <Square size={12} />
        </button>
      </div>
    </div>
  )
}

export { VoiceIndicator }
