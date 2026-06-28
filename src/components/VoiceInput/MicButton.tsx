import { Mic, MicOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tooltip } from '@/components/Tooltip'
import type { MicButtonProps } from './VoiceInput.types'
import { useVoiceInputContext } from './VoiceInputContext'
import { MIC_BUTTON_STYLES } from './MicButton.styles'

function MicButton(props: MicButtonProps) {
  const { onTranscript, onCommand, size = 14, className, disabled = false, commandsEnabled } = props
  const ctx = useVoiceInputContext()

  const isActive = ctx.isListening

  if (disabled) {
    return (
      <Tooltip content="Voice input unavailable" side="top">
        <button
          type="button"
          disabled
          className={cn(MIC_BUTTON_STYLES.base, MIC_BUTTON_STYLES.sizeDefault, MIC_BUTTON_STYLES.disabled, className)}
        >
          <MicOff size={size} />
        </button>
      </Tooltip>
    )
  }

  function handleClick() {
    if (isActive) {
      ctx.stopVoiceInput()
      return
    }
    void ctx.startVoiceInput(onTranscript, commandsEnabled ? onCommand : undefined).catch((err) => {
      console.error('[VoiceInput] Failed to start:', err)
    })
  }

  const tooltipLabel = isActive ? 'Stop voice input' : 'Start voice input'

  const scaleValue = isActive ? 1 + ctx.audioLevel * 0.15 : 1

  const stateClass = isActive ? MIC_BUTTON_STYLES.listening : MIC_BUTTON_STYLES.idle
  const pulseClass = isActive ? MIC_BUTTON_STYLES.pulse : ''

  return (
    <Tooltip content={tooltipLabel} side="top">
      <button
        type="button"
        onClick={handleClick}
        className={cn(MIC_BUTTON_STYLES.base, MIC_BUTTON_STYLES.sizeDefault, stateClass, pulseClass, className)}
        style={{ transform: `scale(${scaleValue})` }}
      >
        <Mic size={size} />
      </button>
    </Tooltip>
  )
}

export { MicButton }
