import { Pause, Play, Square, Volume2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tooltip } from '@/components/Tooltip'
import { AppLoaderGlyph } from '@/components/AppLoader/AppLoaderGlyph'
import type { SpeakerButtonProps } from './TextToSpeech.types'
import { useTextToSpeechContext } from './TextToSpeechContext'
import { SPEAKER_BUTTON_STYLES } from './SpeakerButton.styles'

function SpeakerButton(props: SpeakerButtonProps) {
  const { text, size = 14, className, disabled = false } = props
  const tts = useTextToSpeechContext()

  const isSpeaking = tts.status === 'speaking'
  const isPaused = tts.status === 'paused'
  const isLoading = tts.status === 'loading'
  const isActive = isSpeaking || isPaused || isLoading

  if (disabled) {
    return (
      <Tooltip content="Text-to-speech unavailable" side="top">
        <button
          type="button"
          disabled
          className={cn(SPEAKER_BUTTON_STYLES.base, SPEAKER_BUTTON_STYLES.sizeDefault, SPEAKER_BUTTON_STYLES.disabled, className)}
        >
          <Volume2 size={size} />
        </button>
      </Tooltip>
    )
  }

  function handleClick() {
    if (isLoading) return

    if (isSpeaking) {
      tts.pause()
      return
    }

    if (isPaused) {
      tts.resume()
      return
    }

    tts.speak(text)
  }

  function handleStop(e: React.MouseEvent) {
    e.stopPropagation()
    tts.stop()
  }

  let tooltipLabel = 'Read aloud'
  if (isSpeaking) tooltipLabel = 'Pause'
  if (isPaused) tooltipLabel = 'Resume'
  if (isLoading) tooltipLabel = 'Loading...'

  let stateClass: string = SPEAKER_BUTTON_STYLES.idle
  if (isSpeaking) stateClass = SPEAKER_BUTTON_STYLES.speaking
  if (isPaused) stateClass = SPEAKER_BUTTON_STYLES.paused
  if (isLoading) stateClass = SPEAKER_BUTTON_STYLES.loading

  let icon = <Volume2 size={size} />
  if (isLoading) icon = <AppLoaderGlyph size={size} />
  if (isSpeaking) icon = <Pause size={size} />
  if (isPaused) icon = <Play size={size} />

  return (
    <span className="inline-flex items-center gap-0.5">
      <Tooltip content={tooltipLabel} side="top">
        <button
          type="button"
          onClick={handleClick}
          className={cn(SPEAKER_BUTTON_STYLES.base, SPEAKER_BUTTON_STYLES.sizeDefault, stateClass, className)}
        >
          {icon}
        </button>
      </Tooltip>
      {isActive && !isLoading && (
        <Tooltip content="Stop" side="top">
          <button
            type="button"
            onClick={handleStop}
            className={cn(SPEAKER_BUTTON_STYLES.base, SPEAKER_BUTTON_STYLES.sizeDefault, 'text-red-400 hover:text-red-300 hover:bg-red-500/10')}
          >
            <Square size={size - 2} />
          </button>
        </Tooltip>
      )}
    </span>
  )
}

export { SpeakerButton }
