import type { UsageAppStat } from '@/lib/usage'

export interface PerAppBarChartProps {
  perApp: UsageAppStat[]
}

export interface PerAppBarDatum {
  name: string
  foregroundMs: number
}
