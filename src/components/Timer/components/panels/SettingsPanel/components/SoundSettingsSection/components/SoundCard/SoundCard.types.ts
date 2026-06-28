import type { TimerSound } from '@/components/Timer/constants/timerSounds'

export interface SoundCardProps {
  sound: TimerSound
  /** Whether this card is the user's selected sound. */
  isSelected: boolean
  /** Whether this card is currently playing a preview. */
  isPlaying: boolean
  /** Called when the user selects this card as their active sound. */
  onSelect: (soundId: string) => void
  /** Called when the user clicks the play/preview button. */
  onPreview: (soundId: string) => void
}
