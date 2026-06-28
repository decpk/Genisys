import { Play, VolumeX } from 'lucide-react'

import { cn } from '@/lib/utils'

import { EqualizerIndicator } from '../../../EqualizerIndicator'

import {
  CARD_ACTIVE,
  CARD_BASE,
  CARD_INACTIVE,
  CARD_LABEL_ACTIVE,
  CARD_LABEL_INACTIVE,
  PREVIEW_BUTTON_BASE,
  PREVIEW_BUTTON_INACTIVE,
  PREVIEW_BUTTON_PLAYING,
} from './SoundCard.styles'
import type { SoundCardProps } from './SoundCard.types'

export function SoundCard(props: SoundCardProps): React.JSX.Element {
  const { sound, isSelected, isPlaying, onSelect, onPreview } = props

  const isMuted = sound.id === 'none'
  const cardClass = cn(CARD_BASE, isSelected ? CARD_ACTIVE : CARD_INACTIVE)
  const labelClass = isSelected ? CARD_LABEL_ACTIVE : CARD_LABEL_INACTIVE
  const previewClass = cn(
    PREVIEW_BUTTON_BASE,
    isPlaying ? PREVIEW_BUTTON_PLAYING : PREVIEW_BUTTON_INACTIVE,
  )

  let previewIcon: React.ReactNode = <Play size={12} />
  if (isMuted) previewIcon = <VolumeX size={12} />
  else if (isPlaying) previewIcon = <EqualizerIndicator size={12} />

  const handlePreview = (event: React.MouseEvent) => {
    event.stopPropagation()
    onPreview(sound.id)
  }

  const handleSelect = () => {
    onSelect(sound.id)
  }

  let previewLabel = `Preview ${sound.label}`
  if (isMuted) previewLabel = 'No sound'
  else if (isPlaying) previewLabel = `Stop preview of ${sound.label}`

  return (
    <div className={cardClass}>
      <button
        type="button"
        onClick={handleSelect}
        className="min-w-0 flex-1 truncate text-left outline-none"
        aria-pressed={isSelected}
      >
        <span className={labelClass}>{sound.label}</span>
      </button>
      <button
        type="button"
        onClick={handlePreview}
        disabled={isMuted}
        className={previewClass}
        aria-label={previewLabel}
        title={previewLabel}
      >
        {previewIcon}
      </button>
    </div>
  )
}
