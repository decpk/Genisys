import { STATS_HIGHLIGHTS_TILE_STYLES as S } from './StatsHighlightsTile.styles'
import type { StatsHighlightsTileProps } from './StatsHighlightsTile.types'

export function StatsHighlightsTile(
  props: StatsHighlightsTileProps,
): React.JSX.Element {
  const { icon: Icon, label, value, subLabel } = props

  let subNode: React.ReactNode = null
  if (subLabel) {
    subNode = <span className={S.sub}>{subLabel}</span>
  }

  return (
    <div className={S.card}>
      <span className={S.header}>
        <Icon className={S.icon} />
        {label}
      </span>
      <span className={S.value}>{value}</span>
      {subNode}
    </div>
  )
}
