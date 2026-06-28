import { Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tooltip } from '@/components/Tooltip'
import type { CompletionHeatmapCell } from '../../ProductivityAnalytics.types'

interface CompletionHeatmapProps {
  completionHeatmap: CompletionHeatmapCell[]
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const DAY_FULL_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const HOUR_START = 6
const HOUR_END = 23

function getIntensityClass(count: number, maxCount: number): string {
  if (count === 0) return 'bg-muted/30'
  const ratio = count / maxCount
  if (ratio <= 0.25) return 'bg-emerald-500/20'
  if (ratio <= 0.5) return 'bg-emerald-500/40'
  if (ratio <= 0.75) return 'bg-emerald-500/60'
  return 'bg-emerald-500/80'
}

function formatHour12(hour: number): string {
  const period = hour < 12 ? 'AM' : 'PM'
  const h = hour % 12 === 0 ? 12 : hour % 12
  return `${h} ${period}`
}

function formatHourRange(hour: number): string {
  return `${formatHour12(hour)} – ${formatHour12((hour + 1) % 24)}`
}

export function CompletionHeatmap(props: CompletionHeatmapProps): React.JSX.Element | null {
  const { completionHeatmap } = props

  const hasData = completionHeatmap.length > 0
  if (!hasData) return null

  // Build lookup and find max
  const lookup = new Map<string, number>()
  let maxCount = 1
  let totalCount = 0
  for (const cell of completionHeatmap) {
    const key = `${cell.day}-${cell.hour}`
    lookup.set(key, cell.count)
    totalCount += cell.count
    if (cell.count > maxCount) maxCount = cell.count
  }

  const hours = Array.from({ length: HOUR_END - HOUR_START + 1 }, (_, i) => i + HOUR_START)

  return (
    <div className="rounded-lg border border-border/40 bg-card p-3">
      <div className="flex items-center gap-1.5 mb-3">
        <Zap className="size-3 text-primary" />
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Peak Hours
        </span>
        <span className="text-[9px] text-muted-foreground/60 ml-auto">
          When you complete tasks
        </span>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[280px]">
          {/* Hour labels */}
          <div className="flex ml-7 mb-0.5">
            {hours.map((h) => {
              const showLabel = h % 3 === 0
              return (
                <div
                  key={h}
                  className="flex-1 text-center text-[7px] text-muted-foreground/60"
                >
                  {showLabel ? `${h}` : ''}
                </div>
              )
            })}
          </div>
          {/* Grid rows */}
          {DAY_LABELS.map((dayLabel, dayIndex) => (
            <div key={dayLabel} className="flex items-center gap-1 mb-[2px]">
              <span className="text-[8px] text-muted-foreground w-6 text-right shrink-0">
                {dayLabel}
              </span>
              <div className="flex flex-1 gap-[1px]">
                {hours.map((hour) => {
                  const count = lookup.get(`${dayIndex}-${hour}`) || 0
                  const intensityClass = getIntensityClass(count, maxCount)
                  const isPeak = count > 0 && count === maxCount
                  const share = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0
                  const tooltipContent = (
                    <div className="flex flex-col items-start gap-1 py-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold">{DAY_FULL_LABELS[dayIndex]}</span>
                        <span className="text-[10px] opacity-70">{formatHourRange(hour)}</span>
                        {isPeak && (
                          <span className="ml-0.5 rounded-full bg-emerald-500/90 px-1.5 py-px text-[8px] font-bold uppercase tracking-wide text-white">
                            Peak
                          </span>
                        )}
                      </div>
                      {count > 0 ? (
                        <div className="flex items-center gap-1.5 text-[10px] opacity-80">
                          <span className="font-medium">
                            {count} task{count !== 1 ? 's' : ''} completed
                          </span>
                          <span className="opacity-50">·</span>
                          <span>{share}% of total</span>
                        </div>
                      ) : (
                        <span className="text-[10px] opacity-60">No tasks completed</span>
                      )}
                    </div>
                  )
                  return (
                    <Tooltip
                      key={hour}
                      content={tooltipContent}
                      side="top"
                      variant="popover"
                      triggerClassName="flex flex-1"
                      className="!whitespace-normal"
                    >
                      <div
                        className={cn(
                          'flex-1 aspect-square rounded-[2px] transition-colors',
                          intensityClass,
                        )}
                      />
                    </Tooltip>
                  )
                })}
              </div>
            </div>
          ))}
          {/* Legend */}
          <div className="flex items-center justify-end gap-1 mt-2">
            <span className="text-[8px] text-muted-foreground/60">Less</span>
            <div className="size-2.5 rounded-[2px] bg-muted/30" />
            <div className="size-2.5 rounded-[2px] bg-emerald-500/20" />
            <div className="size-2.5 rounded-[2px] bg-emerald-500/40" />
            <div className="size-2.5 rounded-[2px] bg-emerald-500/60" />
            <div className="size-2.5 rounded-[2px] bg-emerald-500/80" />
            <span className="text-[8px] text-muted-foreground/60">More</span>
          </div>
        </div>
      </div>
    </div>
  )
}
