import { MiniProgressRing } from '../../../MiniProgressRing'

import type { HeroThemeChipProps } from './HeroThemeChip.types'

const BASE_CLASS =
  'flex items-center gap-1.5 rounded-full border border-border/50 bg-background/40 px-1.5 py-1 text-[10.5px] text-foreground/85'
const INTERACTIVE_CLASS = 'hover:border-border/80 hover:bg-background/70 transition-colors'

export function HeroThemeChip(props: HeroThemeChipProps): React.JSX.Element {
  const { color, label, onClick } = props

  let className = BASE_CLASS
  if (onClick) className = `${BASE_CLASS} ${INTERACTIVE_CLASS}`

  const innerContent = (
    <>
      <MiniProgressRing color={color} size={20} strokeWidth={2.5} progress={0.65} />
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
      aria-label={`Theme: ${label}. Click to customize`}
    >
      {innerContent}
    </button>
  )
}
