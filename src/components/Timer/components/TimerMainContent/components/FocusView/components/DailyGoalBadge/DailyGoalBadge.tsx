import { Target } from 'lucide-react'

import { computeGoalProgress } from '@/components/Timer/components/panels/GoalsPanel/utils/computeGoalProgress'

import type { DailyGoalBadgeProps } from './DailyGoalBadge.types'
import { useDailyGoalBadgeData } from './useDailyGoalBadgeData'
import { buildDailyGoalMeterStyle } from './utils/buildDailyGoalMeterStyle'

const DEFAULT_ACCENT = '#0ea5e9'

const ROOT_CLASS =
  'mt-4 inline-flex items-center gap-2 rounded-full border border-border/40 bg-background/70 backdrop-blur-sm px-3 py-1.5 text-[11px] text-muted-foreground'

const METER_TRACK_CLASS = 'relative h-1 w-24 rounded-full bg-secondary/50 overflow-hidden'

const METER_FILL_CLASS = 'h-full rounded-full transition-[width] duration-700'

export function DailyGoalBadge(props: DailyGoalBadgeProps): React.JSX.Element | null {
  const { accentColor } = props
  const data = useDailyGoalBadgeData()

  if (data.targetMinutes <= 0) return null

  const progress = computeGoalProgress(data.achievedMinutes, data.targetMinutes)
  const percent = Math.round(progress * 100)
  const color = accentColor ?? DEFAULT_ACCENT
  const meterStyle = buildDailyGoalMeterStyle(color, percent)

  return (
    <div className={ROOT_CLASS}>
      <Target size={12} style={{ color }} />
      <span className="tabular-nums">
        {data.achievedMinutes}m / {data.targetMinutes}m
      </span>
      <div className={METER_TRACK_CLASS}>
        <div className={METER_FILL_CLASS} style={meterStyle} />
      </div>
      <span className="tabular-nums opacity-80">{percent}%</span>
    </div>
  )
}
