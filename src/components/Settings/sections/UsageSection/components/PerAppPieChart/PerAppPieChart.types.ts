import type { UsageAppStat } from '@/lib/usage'

export interface PerAppPieChartProps {
  perApp: UsageAppStat[]
}

export interface PerAppPieDatum {
  name: string
  value: number
}
