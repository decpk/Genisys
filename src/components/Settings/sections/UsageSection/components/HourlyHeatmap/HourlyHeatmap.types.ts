import type { UsageHourStat } from '@/lib/usage'

export interface HourlyHeatmapProps {
  perHour: UsageHourStat[]
}

export interface HeatmapCell {
  hour: number
  foregroundMs: number
  intensity: number
  showLabel: boolean
}
