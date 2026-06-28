import {
  STATS_TAG_SHARE_DONUT_LEGEND_CONFIG as CONFIG,
  STATS_TAG_SHARE_DONUT_LEGEND_STYLES as S,
} from './StatsTagShareDonutLegend.styles'
import type { StatsTagShareDonutLegendProps } from './StatsTagShareDonutLegend.types'

export function StatsTagShareDonutLegend(
  props: StatsTagShareDonutLegendProps,
): React.JSX.Element {
  const { slices } = props

  const visible = slices.slice(0, CONFIG.maxRows)

  return (
    <div className={S.list}>
      {visible.map((slice) => {
        const swatchStyle: React.CSSProperties = {
          backgroundColor: slice.color,
        }
        return (
          <div key={slice.key} className={S.row}>
            <div className={S.swatch} style={swatchStyle} />
            <span className={S.label}>{slice.label}</span>
            <span className={S.minutes}>{slice.minutes}m</span>
            <span className={S.pct}>{slice.pct}%</span>
          </div>
        )
      })}
    </div>
  )
}
