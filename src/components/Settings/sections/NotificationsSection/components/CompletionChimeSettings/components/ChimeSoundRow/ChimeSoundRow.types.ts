import type { CompletionChimeVariant } from '@/lib/audio-completion'

export interface ChimeSoundRowProps {
  variant: CompletionChimeVariant
  label: string
  description: string
  value: string
  onChange: (soundId: string) => void
  disabled?: boolean
}
