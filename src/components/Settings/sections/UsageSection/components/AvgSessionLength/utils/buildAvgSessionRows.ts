import type { UsageAppStat } from '@/lib/usage'

import { appLabel } from '../../../utils/appLabel'
import { formatDurationMs } from '../../../utils/formatDurationMs'
import type { AvgSessionRow } from '../AvgSessionLength.types'

/** Top-N apps by average foreground session length, with bar ratios. */
export function buildAvgSessionRows(
  perApp: UsageAppStat[],
  topN: number,
): AvgSessionRow[] {
  const ranked = [...perApp]
    .filter((app) => app.avgForegroundMs > 0)
    .sort((a, b) => b.avgForegroundMs - a.avgForegroundMs)
    .slice(0, topN)

  const max = ranked.length > 0 ? ranked[0].avgForegroundMs : 0

  return ranked.map((app) => ({
    appView: app.appView,
    label: appLabel(app.appView),
    avg: formatDurationMs(app.avgForegroundMs),
    ratio: max > 0 ? app.avgForegroundMs / max : 0,
  }))
}
