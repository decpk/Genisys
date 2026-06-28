import { formatMinutesShort } from '../../../../utils/formatMinutesShort'
import {
  STATS_TREND_AREA_TOOLTIP_INLINE as INLINE,
  STATS_TREND_AREA_TOOLTIP_STYLES as S,
} from './StatsTrendAreaTooltip.styles'
import type { StatsTrendAreaTooltipProps } from './StatsTrendAreaTooltip.types'

interface PointPayload {
  dateKey: string
  label: string
  minutes: number
}

export function StatsTrendAreaTooltip(
  props: StatsTrendAreaTooltipProps,
): React.JSX.Element | null {
  const { active, payload } = props

  if (!active || !payload || payload.length === 0) return null

  const point = payload[0].payload as PointPayload
  const inlineStyle: React.CSSProperties = INLINE

  return (
    <div className={S.card} style={inlineStyle}>
      <p className={S.title}>{point.label}</p>
      <p className={S.body}>{formatMinutesShort(point.minutes)} focus</p>
    </div>
  )
}
