import { CalendarDays, Crown, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WeekdayAnalysis } from '../../ProductivityAnalytics.types'

interface WeekdayRhythmProps {
  weekdayAnalysis: WeekdayAnalysis[]
}

export function WeekdayRhythm(props: WeekdayRhythmProps): React.JSX.Element | null {
  const { weekdayAnalysis } = props

  const hasData = weekdayAnalysis.some((d) => d.totalTasks > 0)
  if (!hasData) return null

  // Find best and worst day (only among days with data)
  const daysWithData = weekdayAnalysis.filter((d) => d.totalTasks > 0)
  let bestDay = -1
  let worstDay = -1
  let bestPct = -1
  let worstPct = 101

  for (const d of daysWithData) {
    if (d.avgCompletionPct > bestPct) {
      bestPct = d.avgCompletionPct
      bestDay = d.day
    }
    if (d.avgCompletionPct < worstPct) {
      worstPct = d.avgCompletionPct
      worstDay = d.day
    }
  }

  return (
    <div className="rounded-lg border border-border/40 bg-card p-3">
      <div className="flex items-center gap-1.5 mb-3">
        <CalendarDays className="size-3 text-primary" />
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Weekly Rhythm
        </span>
        <span className="text-[9px] text-muted-foreground/60 ml-auto">
          Avg completion by day
        </span>
      </div>

      <div className="space-y-1.5">
        {weekdayAnalysis.map((d) => {
          const isBest = d.day === bestDay && daysWithData.length > 1
          const isWorst = d.day === worstDay && daysWithData.length > 1
          const noData = d.totalTasks === 0
          const barWidth = noData ? 0 : d.avgCompletionPct

          const barColor = isBest
            ? 'bg-emerald-500/70'
            : isWorst
              ? 'bg-red-400/50'
              : 'bg-primary/40'

          return (
            <div key={d.day} className="flex items-center gap-2">
              <span
                className={cn(
                  'text-[10px] w-7 text-right shrink-0 font-medium',
                  noData ? 'text-muted-foreground/30' : 'text-muted-foreground',
                )}
              >
                {d.label}
              </span>
              <div className="flex-1 h-4 rounded bg-muted/30 overflow-hidden relative">
                <div
                  className={cn('h-full rounded transition-all duration-700', barColor)}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
              <div className="flex items-center gap-1 w-14 justify-end shrink-0">
                {isBest && <Crown className="size-2.5 text-emerald-500" />}
                {isWorst && <AlertTriangle className="size-2.5 text-red-400" />}
                <span
                  className={cn(
                    'text-[10px] tabular-nums font-medium',
                    noData ? 'text-muted-foreground/30' : 'text-foreground',
                  )}
                >
                  {noData ? '—' : `${d.avgCompletionPct}%`}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary badges */}
      {daysWithData.length > 1 && (
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/30">
          <div className="flex items-center gap-1">
            <Crown className="size-2.5 text-emerald-500" />
            <span className="text-[9px] text-muted-foreground">
              Best: <span className="text-foreground font-medium">{weekdayAnalysis[bestDay]?.label}</span>
            </span>
          </div>
          <div className="flex items-center gap-1">
            <AlertTriangle className="size-2.5 text-red-400" />
            <span className="text-[9px] text-muted-foreground">
              Weakest: <span className="text-foreground font-medium">{weekdayAnalysis[worstDay]?.label}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
