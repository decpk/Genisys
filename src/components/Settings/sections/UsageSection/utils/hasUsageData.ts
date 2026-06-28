import type { UsageStats } from '@/lib/usage'

/** True when there's any recorded activity worth charting. */
export function hasUsageData(stats: UsageStats): boolean {
  const { totals } = stats
  return (
    totals.foregroundMs > 0 ||
    totals.openMs > 0 ||
    totals.totalSessions > 0 ||
    stats.perApp.length > 0
  )
}
