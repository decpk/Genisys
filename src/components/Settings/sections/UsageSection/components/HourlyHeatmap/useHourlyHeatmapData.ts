import { useMemo } from 'react'

import { buildHeatmapCells } from './utils/buildHeatmapCells'
import type { HeatmapCell, HourlyHeatmapProps } from './HourlyHeatmap.types'

/** Memoizes the normalised 24-hour heatmap cells. */
export function useHourlyHeatmapData(props: HourlyHeatmapProps): HeatmapCell[] {
  const { perHour } = props
  return useMemo(() => buildHeatmapCells(perHour), [perHour])
}
