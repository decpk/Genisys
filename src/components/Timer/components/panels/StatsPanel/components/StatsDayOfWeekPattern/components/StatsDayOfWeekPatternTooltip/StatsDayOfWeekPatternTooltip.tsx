import { formatMinutesShort } from '../../../../utils/formatMinutesShort'
import type { DayOfWeekStat } from '../../utils/computeDayOfWeekStats'
import {
  STATS_DAY_OF_WEEK_PATTERN_TOOLTIP_INLINE as INLINE,
  STATS_DAY_OF_WEEK_PATTERN_TOOLTIP_STYLES as S,
} from './StatsDayOfWeekPatternTooltip.styles'
import type { StatsDayOfWeekPatternTooltipProps } from './StatsDayOfWeekPatternTooltip.types'

export function StatsDayOfWeekPatternTooltip(
  props: StatsDayOfWeekPatternTooltipProps,
): React.JSX.Element | null {
  const { active, payload } = props

  if (!active || !payload || payload.length === 0) return null

  const stat = payload[0].payload as DayOfWeekStat
  const inlineStyle: React.CSSProperties = INLINE

  return (
    <div className={S.card} style={inlineStyle}>
      <div className={S.title}>{stat.label}</div>
      <div className={S.bodyHighlight}>
        {formatMinutesShort(stat.avgMinutes)} avg
      </div>
      <div className={S.body}>
        {formatMinutesShort(stat.totalMinutes)} total · {stat.sampleCount}{' '}
        day{stat.sampleCount === 1 ? '' : 's'}
      </div>
    </div>
  )
}
