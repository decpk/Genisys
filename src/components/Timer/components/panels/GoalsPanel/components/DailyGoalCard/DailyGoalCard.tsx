import { Target } from 'lucide-react'

import { Slider } from '@/components/ui/slider'

import { computeGoalProgress } from '../../utils/computeGoalProgress'
import { formatGoalMinutes } from '../../utils/formatGoalMinutes'

import type { DailyGoalCardProps } from './DailyGoalCard.types'

const RADIUS = 36
const CIRC = 2 * Math.PI * RADIUS

export function DailyGoalCard(props: DailyGoalCardProps): React.JSX.Element {
  const { achievedMinutes, targetMinutes, onTargetChange } = props

  const progress = computeGoalProgress(achievedMinutes, targetMinutes)
  const dashOffset = CIRC * (1 - progress)
  const percent = Math.round(progress * 100)
  const remaining = Math.max(0, targetMinutes - achievedMinutes)
  const isMet = achievedMinutes >= targetMinutes && targetMinutes > 0

  let statusLine: string
  if (targetMinutes <= 0) statusLine = 'Set a target to get started'
  else if (isMet) statusLine = `\u{1F389} Goal achieved \u2014 ${formatGoalMinutes(achievedMinutes)} today`
  else statusLine = `${formatGoalMinutes(remaining)} to go today`

  return (
    <section className="px-3 pt-3">
      <div className="rounded-xl border border-border/50 bg-card p-3.5">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <Target size={11} />
          Daily focus goal
        </div>

        <div className="mt-2 flex items-center gap-4">
          <div className="relative shrink-0">
            <svg width={88} height={88} viewBox="0 0 88 88">
              <circle
                cx={44}
                cy={44}
                r={RADIUS}
                fill="none"
                stroke="currentColor"
                strokeOpacity={0.12}
                strokeWidth={7}
              />
              <circle
                cx={44}
                cy={44}
                r={RADIUS}
                fill="none"
                stroke="currentColor"
                strokeWidth={7}
                strokeLinecap="round"
                strokeDasharray={CIRC}
                strokeDashoffset={dashOffset}
                transform="rotate(-90 44 44)"
                className="text-primary transition-[stroke-dashoffset] duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-base font-bold tabular-nums leading-none">{percent}%</span>
              <span className="text-[9px] text-muted-foreground mt-0.5">complete</span>
            </div>
          </div>

          <div className="flex-1 min-w-0 flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm font-semibold tabular-nums">
                {formatGoalMinutes(achievedMinutes)}
              </span>
              <span className="text-xs text-muted-foreground tabular-nums">
                / {formatGoalMinutes(targetMinutes)}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">{statusLine}</p>
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Target</span>
            <span className="tabular-nums">{formatGoalMinutes(targetMinutes)}</span>
          </div>
          <Slider
            min={15}
            max={480}
            step={15}
            value={[targetMinutes]}
            onValueChange={(vals) => onTargetChange(vals[0] ?? 15)}
          />
        </div>
      </div>
    </section>
  )
}
