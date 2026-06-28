import type { HeatmapCell } from '../../../../utils/timeline-insights/heatmap'

export interface TimelineHeatmapProps {
  cells: HeatmapCell[]
  maxCount: number
  loading: boolean
}
