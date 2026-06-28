import tauriApi from '@/tauri-api-bridge'

import type {
  UsageAppStat,
  UsageDayStat,
  UsageHourStat,
  UsageRange,
  UsageSessionTotals,
  UsageStats,
  UsageTotals,
} from '../usage.types'

const EMPTY_TOTALS: UsageTotals = {
  foregroundMs: 0,
  openMs: 0,
  sessionMs: 0,
  totalSessions: 0,
}

const EMPTY_SESSION_TOTALS: UsageSessionTotals = {
  count: 0,
  totalMs: 0,
  avgMs: 0,
}

function normalizeTotals(value: unknown): UsageTotals {
  const t = (value ?? {}) as Partial<UsageTotals>
  return {
    foregroundMs: Number(t.foregroundMs) || 0,
    openMs: Number(t.openMs) || 0,
    sessionMs: Number(t.sessionMs) || 0,
    totalSessions: Number(t.totalSessions) || 0,
  }
}

function normalizeSessionTotals(value: unknown): UsageSessionTotals {
  const t = (value ?? {}) as Partial<UsageSessionTotals>
  return {
    count: Number(t.count) || 0,
    totalMs: Number(t.totalMs) || 0,
    avgMs: Number(t.avgMs) || 0,
  }
}

function normalizePerApp(value: unknown): UsageAppStat[] {
  if (!Array.isArray(value)) return []
  return value.map((raw) => {
    const r = (raw ?? {}) as Partial<UsageAppStat>
    return {
      appView: String(r.appView ?? ''),
      foregroundMs: Number(r.foregroundMs) || 0,
      openMs: Number(r.openMs) || 0,
      sessions: Number(r.sessions) || 0,
      avgForegroundMs: Number(r.avgForegroundMs) || 0,
    }
  })
}

function normalizePerDay(value: unknown): UsageDayStat[] {
  if (!Array.isArray(value)) return []
  return value.map((raw) => {
    const r = (raw ?? {}) as Partial<UsageDayStat>
    return {
      date: String(r.date ?? ''),
      foregroundMs: Number(r.foregroundMs) || 0,
      openMs: Number(r.openMs) || 0,
      sessions: Number(r.sessions) || 0,
    }
  })
}

function normalizePerHour(value: unknown): UsageHourStat[] {
  if (!Array.isArray(value)) return []
  return value.map((raw) => {
    const r = (raw ?? {}) as Partial<UsageHourStat>
    return {
      hour: Number(r.hour) || 0,
      foregroundMs: Number(r.foregroundMs) || 0,
    }
  })
}

/**
 * Loads aggregated usage stats for an optional date range. Every field is
 * coerced/normalized to a safe default so the consuming UI never crashes on a
 * partial or missing backend response.
 */
export async function loadUsageStats(range?: UsageRange): Promise<UsageStats> {
  const raw = (await tauriApi.getUsageStats(range)) as
    | Partial<UsageStats>
    | null
    | undefined
  if (!raw) {
    return {
      totals: EMPTY_TOTALS,
      perApp: [],
      perDay: [],
      perHour: [],
      sessionTotals: EMPTY_SESSION_TOTALS,
    }
  }
  return {
    totals: normalizeTotals(raw.totals),
    perApp: normalizePerApp(raw.perApp),
    perDay: normalizePerDay(raw.perDay),
    perHour: normalizePerHour(raw.perHour),
    sessionTotals: normalizeSessionTotals(raw.sessionTotals),
  }
}
