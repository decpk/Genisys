import { computeIntensityClass } from '../../utils/computeIntensityClass'
import { normalizeHeatmapData } from '../../utils/normalizeHeatmapData'

import type { StatsHeatmapGridProps } from './StatsHeatmapGrid.types'

export function StatsHeatmapGrid(
  props: StatsHeatmapGridProps,
): React.JSX.Element {
  const { cells } = props

  const grid = normalizeHeatmapData(cells)

  return (
    <section className="flex flex-col gap-2 px-3 py-3 border-b border-border/40">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Last 30 days
      </div>
      <div className="flex flex-col gap-0.5">
        {grid.cells.map((row, rIdx) => (
          <div key={rIdx} className="flex gap-0.5">
            {row.map((cell, cIdx) => {
              const intensity = computeIntensityClass(
                cell.minutes,
                grid.maxMinutes,
              )
              const cellClass = `h-3 w-3 rounded-[2px] ${intensity}`
              return (
                <div
                  key={cell.dateKey + cIdx}
                  className={cellClass}
                  title={`${cell.dateKey}: ${cell.minutes}m`}
                />
              )
            })}
          </div>
        ))}
      </div>
    </section>
  )
}
