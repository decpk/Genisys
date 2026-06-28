export interface StatsRange {
  fromTs: number
  toTs: number
}

export interface StatsTagBreakdown {
  tagId: string | null
  label: string
  minutes: number
}

export interface StatsHeatmapCell {
  dateKey: string
  minutes: number
}

export interface StatsTotals {
  totalFocusMinutes: number
  totalSessions: number
  currentStreak: number
  longestStreak: number
}

export interface StatsResult {
  weekly: number[]
  heatmap: StatsHeatmapCell[]
  totals: StatsTotals
  perTag: StatsTagBreakdown[]
}

export interface StatsPanelProps {}
