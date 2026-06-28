import type { UsageAppStat } from '@/lib/usage'

import { appLabel } from '../../../utils/appLabel'
import type { PerAppBarDatum } from '../PerAppBarChart.types'

/** Sorts apps by foreground time descending and keeps the top N. */
export function buildPerAppBars(
  perApp: UsageAppStat[],
  topN: number,
): PerAppBarDatum[] {
  return [...perApp]
    .filter((app) => app.foregroundMs > 0)
    .sort((a, b) => b.foregroundMs - a.foregroundMs)
    .slice(0, topN)
    .map((app) => ({
      name: appLabel(app.appView),
      foregroundMs: app.foregroundMs,
    }))
}
