import type { StatsTagBreakdown } from '../../StatsPanel.types'
import type { TagShareSlice } from './utils/computeTagShareSlices'

export interface StatsTagShareDonutProps {
  perTag: StatsTagBreakdown[]
}

export interface StatsTagShareDonutViewModel {
  hasData: boolean
  slices: TagShareSlice[]
  totalMinutes: number
}
