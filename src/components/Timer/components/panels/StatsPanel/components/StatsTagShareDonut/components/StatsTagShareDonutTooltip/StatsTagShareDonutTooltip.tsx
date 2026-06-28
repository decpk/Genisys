import { formatMinutesShort } from '../../../../utils/formatMinutesShort'
import type { TagShareSlice } from '../../utils/computeTagShareSlices'
import {
  STATS_TAG_SHARE_DONUT_TOOLTIP_INLINE as INLINE,
  STATS_TAG_SHARE_DONUT_TOOLTIP_STYLES as S,
} from './StatsTagShareDonutTooltip.styles'
import type { StatsTagShareDonutTooltipProps } from './StatsTagShareDonutTooltip.types'

export function StatsTagShareDonutTooltip(
  props: StatsTagShareDonutTooltipProps,
): React.JSX.Element | null {
  const { active, payload } = props

  if (!active || !payload || payload.length === 0) return null

  const slice = payload[0].payload as TagShareSlice
  const inlineStyle: React.CSSProperties = INLINE

  return (
    <div className={S.card} style={inlineStyle}>
      <div className={S.title}>{slice.label}</div>
      <div className={S.body}>
        {formatMinutesShort(slice.minutes)} · {slice.pct}%
      </div>
    </div>
  )
}
