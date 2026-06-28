import type { UsageAppStat } from '@/lib/usage'

export interface MostUsedTableProps {
  perApp: UsageAppStat[]
}

export interface MostUsedRow {
  appView: string
  label: string
  foreground: string
  open: string
  sessions: number
}
