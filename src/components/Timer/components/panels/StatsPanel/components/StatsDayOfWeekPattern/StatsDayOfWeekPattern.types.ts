import type { DayOfWeekStat } from './utils/computeDayOfWeekStats'
import type { StatsHeatmapCell } from '../../StatsPanel.types'

export interface StatsDayOfWeekPatternProps {
  cells: StatsHeatmapCell[]
}

export interface StatsDayOfWeekPatternViewModel {
  hasData: boolean
  stats: DayOfWeekStat[]
  bestIndex: number
  bestLabel: string | null
  bestAvgMinutes: number
}
