import type { UsageDayStat } from '@/lib/usage'

export interface TrendChartProps {
  perDay: UsageDayStat[]
}

export interface TrendDatum {
  label: string
  foregroundMs: number
}
