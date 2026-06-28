import { Target } from 'lucide-react'

import { formatMinutesShort } from '../../utils/formatMinutesShort'
import { StatsGoalProgressBar } from './components/StatsGoalProgressBar'
import { StatsGoalProgressRing } from './components/StatsGoalProgressRing'
import { STATS_GOAL_PROGRESS_STYLES as S } from './StatsGoalProgress.styles'
import { useStatsGoalProgressData } from './useStatsGoalProgressData'

export function StatsGoalProgress(): React.JSX.Element | null {
  const data = useStatsGoalProgressData()

  if (!data.hasGoals) return null

  const dailyValueLabel = `${formatMinutesShort(data.dailyCurrent)} / ${formatMinutesShort(data.dailyTarget)}`
  const weeklyValueLabel = `${formatMinutesShort(data.weeklyCurrent)} / ${formatMinutesShort(data.weeklyTarget)}`

  let body: React.ReactNode

  if (data.dailyTarget > 0) {
    body = (
      <div className={S.body}>
        <div className={S.ringWrap}>
          <StatsGoalProgressRing
            pct={data.dailyPct}
            centerLabel={`${data.dailyPct}%`}
            centerSubLabel="today"
          />
        </div>
        <div className={S.rightCol}>
          <div className={S.rowLabel}>
            <span className={S.rowLabelText}>Daily</span>
            <span className={S.rowLabelValue}>{dailyValueLabel}</span>
          </div>
          <StatsGoalProgressBar
            pct={data.weeklyPct}
            label="Weekly"
            valueLabel={weeklyValueLabel}
          />
        </div>
      </div>
    )
  } else {
    body = (
      <StatsGoalProgressBar
        pct={data.weeklyPct}
        label="Weekly"
        valueLabel={weeklyValueLabel}
      />
    )
  }

  return (
    <section className={S.section}>
      <div className={S.header}>
        <Target className="size-3 text-primary" />
        <span>Goals</span>
      </div>
      {body}
    </section>
  )
}
