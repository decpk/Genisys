import { Volume2, VolumeX } from 'lucide-react'

import type { HeroSoundChipProps } from './HeroSoundChip.types'

const BASE_CLASS =
  'flex items-center gap-1.5 rounded-full border border-border/50 bg-background/40 px-2 py-1 text-[10.5px] text-foreground/85'
const INTERACTIVE_CLASS = 'hover:border-border/80 hover:bg-background/70 transition-colors'

export function HeroSoundChip(props: HeroSoundChipProps): React.JSX.Element {
  const { label, isMuted, onClick } = props

  let icon: React.ReactNode = <Volume2 size={11} className="text-foreground/70" />
  if (isMuted) icon = <VolumeX size={11} className="text-muted-foreground" />

  let className = BASE_CLASS
  if (onClick) className = `${BASE_CLASS} ${INTERACTIVE_CLASS}`

  const innerContent = (
    <>
      {icon}
      <span className="font-medium">{label}</span>
    </>
  )

  if (!onClick) {
    return <span className={className}>{innerContent}</span>
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={className}
      aria-label={`Sound: ${label}. Click to customize`}
    >
      {innerContent}
    </button>
  )
}
