import type { LucideIcon } from 'lucide-react'

import type {
  StatsHeatmapCell,
  StatsTagBreakdown,
  StatsTotals,
} from '../../StatsPanel.types'

export interface StatsHighlightsProps {
  totals: StatsTotals
  heatmap: StatsHeatmapCell[]
  perTag: StatsTagBreakdown[]
}

export interface HighlightTileData {
  /** Stable react key. */
  key: string
  /** Lucide icon component to render. */
  icon: LucideIcon
  /** Top label (caps small). */
  label: string
  /** Big value (already formatted). */
  value: string
  /** Optional sub-label (small text below the value). */
  subLabel?: string
}

export interface StatsHighlightsViewModel {
  hasData: boolean
  tiles: HighlightTileData[]
}
