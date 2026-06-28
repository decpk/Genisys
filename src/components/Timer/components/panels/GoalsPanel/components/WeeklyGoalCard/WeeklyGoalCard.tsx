import { CalendarDays } from 'lucide-react'

import { Slider } from '@/components/ui/slider'

import { computeGoalProgress } from '../../utils/computeGoalProgress'
import { formatGoalMinutes } from '../../utils/formatGoalMinutes'

import type { WeeklyGoalCardProps } from './WeeklyGoalCard.types'

export function WeeklyGoalCard(props: WeeklyGoalCardProps): React.JSX.Element {
  const { achievedMinutes, targetMinutes, onTargetChange } = props

  const progress = computeGoalProgress(achievedMinutes, targetMinutes)
  const widthPct = `${Math.round(progress * 100)}%`
  const percent = Math.round(progress * 100)
  const remaining = Math.max(0, targetMinutes - achievedMinutes)
  const isMet = achievedMinutes >= targetMinutes && targetMinutes > 0

  let statusLine: string
  if (targetMinutes <= 0) statusLine = 'Set a weekly target'
  else if (isMet) statusLine = `\u{1F389} Weekly goal hit`
  else statusLine = `${formatGoalMinutes(remaining)} remaining this week`

  return (
    <section className="px-3 pt-3">
      <div className="rounded-xl border border-border/50 bg-card p-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <CalendarDays size={11} />
            Weekly goal
          </div>
          <span className="text-[10px] tabular-nums text-muted-foreground">{percent}%</span>
        </div>

        <div className="mt-2 flex items-baseline justify-between gap-2">
          <span className="text-lg font-semibold tabular-nums">
            {formatGoalMinutes(achievedMinutes)}
          </span>
          <span className="text-xs text-muted-foreground tabular-nums">
            / {formatGoalMinutes(targetMinutes)}
          </span>
        </div>

        <div className="mt-2 h-2 w-full rounded-full bg-secondary/60 overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500"
            style={{ width: widthPct }}
          />
        </div>

        <p className="mt-2 text-[11px] text-muted-foreground">{statusLine}</p>

        <div className="mt-3 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Target</span>
            <span className="tabular-nums">{formatGoalMinutes(targetMinutes)}</span>
          </div>
          <Slider
            min={60}
            max={3000}
            step={30}
            value={[targetMinutes]}
            onValueChange={(vals) => onTargetChange(vals[0] ?? 60)}
          />
        </div>
      </div>
    </section>
  )
}
