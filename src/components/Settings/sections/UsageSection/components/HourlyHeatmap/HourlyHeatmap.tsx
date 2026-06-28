import { memo } from 'react'

import { formatDurationMs } from '../../utils/formatDurationMs'
import { useHourlyHeatmapData } from './useHourlyHeatmapData'
import { heatCellStyle } from './utils/heatCellStyle'
import type { HourlyHeatmapProps } from './HourlyHeatmap.types'

export const HourlyHeatmap = memo(function HourlyHeatmap(
  props: HourlyHeatmapProps,
): React.JSX.Element {
  const cells = useHourlyHeatmapData(props)

  return (
    <div className="flex flex-col gap-1.5">
      <div className="grid grid-cols-24 gap-1" style={{ gridTemplateColumns: 'repeat(24, minmax(0, 1fr))' }}>
        {cells.map((cell) => {
          const title = `${cell.hour}:00 — ${formatDurationMs(cell.foregroundMs)}`
          return (
            <div
              key={cell.hour}
              title={title}
              style={heatCellStyle(cell.intensity)}
              className="h-7 rounded-sm border border-border/40"
            />
          )
        })}
      </div>
      <div className="grid gap-1 text-[10px] text-muted-foreground" style={{ gridTemplateColumns: 'repeat(24, minmax(0, 1fr))' }}>
        {cells.map((cell) => {
          const label = cell.showLabel ? `${cell.hour}h` : ''
          return (
            <span key={cell.hour} className="text-center">
              {label}
            </span>
          )
        })}
      </div>
    </div>
  )
})
