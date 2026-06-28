import type { UsageAppStat } from '@/lib/usage'

export interface AvgSessionLengthProps {
  perApp: UsageAppStat[]
}

export interface AvgSessionRow {
  appView: string
  label: string
  avg: string
  ratio: number
}
