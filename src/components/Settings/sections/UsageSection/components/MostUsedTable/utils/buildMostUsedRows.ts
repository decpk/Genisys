import type { UsageAppStat } from '@/lib/usage'

import { appLabel } from '../../../utils/appLabel'
import { formatDurationMs } from '../../../utils/formatDurationMs'
import type { MostUsedRow } from '../MostUsedTable.types'

/** Ranks apps by foreground time and formats each column for display. */
export function buildMostUsedRows(perApp: UsageAppStat[]): MostUsedRow[] {
  return [...perApp]
    .filter((app) => app.foregroundMs > 0 || app.openMs > 0)
    .sort((a, b) => b.foregroundMs - a.foregroundMs)
    .map((app) => ({
      appView: app.appView,
      label: appLabel(app.appView),
      foreground: formatDurationMs(app.foregroundMs),
      open: formatDurationMs(app.openMs),
      sessions: app.sessions,
    }))
}
