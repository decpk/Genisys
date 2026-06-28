import { STATS_GOAL_PROGRESS_RING_STYLES as S } from './StatsGoalProgressRing.styles'
import type { StatsGoalProgressRingProps } from './StatsGoalProgressRing.types'

const DEFAULT_SIZE = 64
const DEFAULT_STROKE = 6

export function StatsGoalProgressRing(
  props: StatsGoalProgressRingProps,
): React.JSX.Element {
  const { pct, size, strokeWidth, centerLabel, centerSubLabel } = props

  const dim = size ?? DEFAULT_SIZE
  const sw = strokeWidth ?? DEFAULT_STROKE
  const radius = (dim - sw) / 2
  const circumference = 2 * Math.PI * radius

  const safePct = Math.max(0, Math.min(100, pct))
  const dashOffset = circumference * (1 - safePct / 100)

  const wrapStyle: React.CSSProperties = { width: dim, height: dim }

  return (
    <div className={S.wrap} style={wrapStyle}>
      <svg width={dim} height={dim}>
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={radius}
          strokeWidth={sw}
          fill="none"
          className={S.track}
        />
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={radius}
          strokeWidth={sw}
          fill="none"
          strokeLinecap="round"
          className={S.progress}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${dim / 2} ${dim / 2})`}
        />
      </svg>
      <div className={S.centerWrap}>
        <span className={S.centerLabel}>{centerLabel}</span>
        <span className={S.centerSub}>{centerSubLabel}</span>
      </div>
    </div>
  )
}
