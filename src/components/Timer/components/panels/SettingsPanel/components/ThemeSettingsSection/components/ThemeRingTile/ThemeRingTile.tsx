import { cn } from '@/lib/utils'

import { MiniProgressRing } from '../../../MiniProgressRing'

import {
  TILE_ACTIVE,
  TILE_BASE,
  TILE_INACTIVE,
  TILE_LABEL_ACTIVE,
  TILE_LABEL_INACTIVE,
} from './ThemeRingTile.styles'
import type { ThemeRingTileProps } from './ThemeRingTile.types'

export function ThemeRingTile(props: ThemeRingTileProps): React.JSX.Element {
  const { theme, isActive, onSelect } = props

  const tileClass = cn(TILE_BASE, isActive ? TILE_ACTIVE : TILE_INACTIVE)
  const labelClass = isActive ? TILE_LABEL_ACTIVE : TILE_LABEL_INACTIVE

  const handleClick = () => {
    onSelect(theme.id)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={tileClass}
      aria-pressed={isActive}
      title={theme.label}
    >
      <MiniProgressRing color={theme.ringColor} size={32} strokeWidth={3} progress={0.65} />
      <span className={labelClass}>{theme.label}</span>
    </button>
  )
}
