import type { UsageAppStat } from '@/lib/usage'

import { appLabel } from '../../../utils/appLabel'
import type { PerAppPieDatum } from '../PerAppPieChart.types'

/** Top-N apps by foreground share for the pie chart. */
export function buildPerAppSlices(
  perApp: UsageAppStat[],
  topN: number,
): PerAppPieDatum[] {
  return [...perApp]
    .filter((app) => app.foregroundMs > 0)
    .sort((a, b) => b.foregroundMs - a.foregroundMs)
    .slice(0, topN)
    .map((app) => ({
      name: appLabel(app.appView),
      value: app.foregroundMs,
    }))
}
