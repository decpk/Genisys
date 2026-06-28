import type { DailySeriesPoint } from './utils/computeDailySeries'
import type { StatsHeatmapCell } from '../../StatsPanel.types'

export interface StatsTrendAreaProps {
  cells: StatsHeatmapCell[]
}

export interface StatsTrendAreaViewModel {
  hasData: boolean
  series: DailySeriesPoint[]
  averageMinutes: number
}
