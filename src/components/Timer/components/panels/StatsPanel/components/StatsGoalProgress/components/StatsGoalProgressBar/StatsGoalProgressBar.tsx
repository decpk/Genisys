import { STATS_GOAL_PROGRESS_BAR_STYLES as S } from './StatsGoalProgressBar.styles'
import type { StatsGoalProgressBarProps } from './StatsGoalProgressBar.types'

export function StatsGoalProgressBar(
  props: StatsGoalProgressBarProps,
): React.JSX.Element {
  const { pct, label, valueLabel } = props

  const safePct = Math.max(0, Math.min(100, pct))
  const fillStyle: React.CSSProperties = { width: `${safePct}%` }

  return (
    <div className={S.wrap}>
      <div className={S.topRow}>
        <span className={S.label}>{label}</span>
        <span className={S.value}>{valueLabel}</span>
      </div>
      <div className={S.track}>
        <div className={S.fill} style={fillStyle} />
      </div>
    </div>
  )
}
