import { memo, useMemo } from 'react'

import { Tooltip } from '@/components/Tooltip'

import { TIMER_TILE_WEEKLY_DAY_LABELS } from '../../TimerTile.constants'

interface TimerTileWeeklyBarsProps {
  /** Index 0 = today, …, 6 = six days ago. */
  weeklyMinutes: number[]
}

interface BarProps {
  min: number
  max: number
  label: string
  isToday: boolean
}

const FULL_DAY_LABELS: Record<string, string> = {
  M: 'Monday',
  T: 'Tuesday',
  W: 'Wednesday',
  Th: 'Thursday',
  F: 'Friday',
  S: 'Saturday',
  Su: 'Sunday',
  Y: 'Yesterday',
}

function getFullDayLabel(label: string, isToday: boolean): string {
  if (isToday) return 'Today'
  return FULL_DAY_LABELS[label] ?? label
}

function formatBarMinutes(min: number): string {
  if (min <= 0) return '0 min'
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function Bar(props: BarProps): React.JSX.Element {
  const { min, max, label, isToday } = props
  const heightPct = Math.round((min / max) * 100)
  const fillClass = isToday
    ? 'w-full bg-primary rounded-sm transition-all duration-300 cursor-default'
    : 'w-full bg-primary/30 rounded-sm transition-all duration-300 cursor-default'
  const minHeight = min > 0 ? 6 : 2
  const dayLabel = getFullDayLabel(label, isToday)
  const tooltipContent = (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[11px] font-medium">{dayLabel}</span>
      <span className="text-[10px] text-muted-foreground tabular-nums">
        {formatBarMinutes(min)}
      </span>
    </div>
  )
  return (
    <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
      <div className="w-full h-9 flex items-end">
        <Tooltip content={tooltipContent} side="top" delayMs={150}>
          <div
            className={fillClass}
            style={{ height: `${Math.max(minHeight, heightPct)}%` }}
            aria-label={`${dayLabel}: ${formatBarMinutes(min)}`}
          />
        </Tooltip>
      </div>
    </div>
  )
}

export const TimerTileWeeklyBars = memo(function TimerTileWeeklyBars(
  props: TimerTileWeeklyBarsProps,
): React.JSX.Element {
  const { weeklyMinutes } = props
  const max = useMemo(() => Math.max(1, ...weeklyMinutes), [weeklyMinutes])
  const ordered = useMemo(() => [...weeklyMinutes].reverse(), [weeklyMinutes])
  const labels = useMemo(() => [...TIMER_TILE_WEEKLY_DAY_LABELS].reverse(), [])

  return (
    <div className="flex items-end justify-between gap-1 h-12 px-1">
      {ordered.map((min, idx) => (
        <Bar
          key={idx}
          min={min}
          max={max}
          label={labels[idx]}
          isToday={idx === ordered.length - 1}
        />
      ))}
    </div>
  )
})
