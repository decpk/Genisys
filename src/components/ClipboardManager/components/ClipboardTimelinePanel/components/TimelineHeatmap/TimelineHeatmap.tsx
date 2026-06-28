import { memo, useMemo } from 'react'
import { Grid3X3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AppInlineLoader } from '@/components/AppLoader'
import { Tooltip } from '@/components/Tooltip'
import { computeHeatmapIntensity } from '../../../../utils/timeline-insights/heatmap'
import { formatLocalDate } from '../../utils/formatLocalDate'
import { getDayLabel, getFullDateLabel } from './utils/getDayLabel'
import { formatHeatmapTooltip } from './utils/formatHeatmapTooltip'
import type { TimelineHeatmapProps } from './TimelineHeatmap.types'
import {
  HEATMAP_ROOT, HEATMAP_HEADER, HEATMAP_HEADER_LEFT,
  HEATMAP_HEADER_ICON, HEATMAP_HEADER_TITLE, HEATMAP_HEADER_SUBTITLE,
  HEATMAP_GRID, HEATMAP_DAY_ROW, HEATMAP_DAY_ROW_TODAY,
  HEATMAP_DAY_LABEL, HEATMAP_DAY_LABEL_TODAY,
  HEATMAP_CELL, HEATMAP_LEGEND, HEATMAP_LEGEND_LABEL,
  HEATMAP_LEGEND_CELL, HEATMAP_LOADER,
} from './TimelineHeatmap.styles'

const INTENSITY_COLORS = [
  'bg-muted/30',
  'bg-primary/25',
  'bg-primary/50',
  'bg-primary/75',
  'bg-primary',
]

const HOUR_LABELS = [0, 6, 12, 18]

export const TimelineHeatmap = memo(function TimelineHeatmap(props: TimelineHeatmapProps): React.JSX.Element {
  const { cells, maxCount, loading } = props

  const todayDate = useMemo(() => formatLocalDate(new Date()), [])

  const totalCount = useMemo(
    () => cells.reduce((sum, c) => sum + c.count, 0),
    [cells]
  )

  const dayRows = useMemo(() => {
    const dateMap = new Map<string, Array<{ hour: number; count: number }>>()
    for (const cell of cells) {
      const existing = dateMap.get(cell.date)
      if (existing) existing.push({ hour: cell.hour, count: cell.count })
      else dateMap.set(cell.date, [{ hour: cell.hour, count: cell.count }])
    }
    return [...dateMap.entries()].map(([date, hourCells]) => ({
      date,
      label: getDayLabel(date),
      hours: hourCells.sort((a, b) => a.hour - b.hour),
    }))
  }, [cells])

  if (loading) {
    return (
      <div className={HEATMAP_ROOT}>
        <div className={HEATMAP_HEADER}>
          <div className={HEATMAP_HEADER_LEFT}>
            <Grid3X3 className={HEATMAP_HEADER_ICON} />
            <span className={HEATMAP_HEADER_TITLE}>7-Day Activity</span>
          </div>
        </div>
        <div className={HEATMAP_LOADER}>
          <AppInlineLoader message="Loading activity data…" />
        </div>
      </div>
    )
  }

  if (dayRows.length === 0) return <div />

  const hourLabelsRow = (
    <div className={HEATMAP_DAY_ROW}>
      <div className={HEATMAP_DAY_LABEL} />
      {Array.from({ length: 24 }, (_, h) => {
        const showLabel = HOUR_LABELS.includes(h)
        const labelNode = showLabel ? (
          <span className="text-[8px] font-medium text-muted-foreground/45 tabular-nums">{h}</span>
        ) : null
        return (
          <div key={h} className="size-[10px] flex items-center justify-center">
            {labelNode}
          </div>
        )
      })}
    </div>
  )

  const legend = (
    <div className={HEATMAP_LEGEND}>
      <span className={HEATMAP_LEGEND_LABEL}>Less</span>
      {INTENSITY_COLORS.map((color, i) => (
        <div key={i} className={cn(HEATMAP_LEGEND_CELL, color)} />
      ))}
      <span className={HEATMAP_LEGEND_LABEL}>More</span>
    </div>
  )

  return (
    <div className={HEATMAP_ROOT}>
      <div className={HEATMAP_HEADER}>
        <div className={HEATMAP_HEADER_LEFT}>
          <Grid3X3 className={HEATMAP_HEADER_ICON} />
          <span className={HEATMAP_HEADER_TITLE}>7-Day Activity</span>
        </div>
        {totalCount > 0 && (
          <span className={HEATMAP_HEADER_SUBTITLE}>
            {totalCount.toLocaleString()} {totalCount === 1 ? 'item' : 'items'}
          </span>
        )}
      </div>
      <div className={HEATMAP_GRID}>
        {hourLabelsRow}
        {dayRows.map((row) => {
          const isToday = row.date === todayDate
          const dayTooltip = isToday
            ? `${getFullDateLabel(row.date)} · Today`
            : getFullDateLabel(row.date)
          return (
            <div key={row.date} className={cn(HEATMAP_DAY_ROW, isToday && HEATMAP_DAY_ROW_TODAY)}>
              <Tooltip content={dayTooltip} side="left" delayMs={120}>
                <span className={cn(HEATMAP_DAY_LABEL, isToday && HEATMAP_DAY_LABEL_TODAY)}>{row.label}</span>
              </Tooltip>
              {row.hours.map((cell) => {
                const intensity = computeHeatmapIntensity(cell.count, maxCount)
                const tooltipText = formatHeatmapTooltip(row.label, cell.hour, cell.count, row.date)
                return (
                  <Tooltip
                    key={cell.hour}
                    content={tooltipText}
                    side="top"
                    delayMs={120}
                  >
                    <div className={cn(HEATMAP_CELL, INTENSITY_COLORS[intensity])} />
                  </Tooltip>
                )
              })}
            </div>
          )
        })}
      </div>
      {legend}
    </div>
  )
})
