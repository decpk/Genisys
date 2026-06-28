export type UsageSegmentKind = 'foreground' | 'open' | 'session'

/** Inclusive date range, dates formatted as 'YYYY-MM-DD'. */
export interface UsageRange {
  fromDate?: string
  toDate?: string
}

export interface UsageTotals {
  foregroundMs: number
  openMs: number
  sessionMs: number
  totalSessions: number
}

export interface UsageAppStat {
  appView: string
  foregroundMs: number
  openMs: number
  sessions: number
  avgForegroundMs: number
}

export interface UsageDayStat {
  date: string
  foregroundMs: number
  openMs: number
  sessions: number
}

export interface UsageHourStat {
  hour: number
  foregroundMs: number
}

export interface UsageSessionTotals {
  count: number
  totalMs: number
  avgMs: number
}

export interface UsageStats {
  totals: UsageTotals
  perApp: UsageAppStat[]
  perDay: UsageDayStat[]
  perHour: UsageHourStat[]
  sessionTotals: UsageSessionTotals
}

export interface UsageSessionRow {
  id: string
  appView: string | null
  kind: UsageSegmentKind
  startedAt: number
  endedAt: number
  durationMs: number
  dateKey: string
  hour: number
}
