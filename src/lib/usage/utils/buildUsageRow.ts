import type { UsageSegmentKind, UsageSessionRow } from '../usage.types'
import { getDateKey } from './getDateKey'
import { getHour } from './getHour'

/**
 * Builds a fully-populated {@link UsageSessionRow} from a raw segment. The id
 * is generated with `crypto.randomUUID()`; `durationMs`, `dateKey`, and `hour`
 * are derived from the span (dateKey/hour come from `startedAt`, LOCAL time).
 */
export function buildUsageRow(input: {
  kind: UsageSegmentKind
  appView: string | null
  startedAt: number
  endedAt: number
}): UsageSessionRow {
  const { kind, appView, startedAt, endedAt } = input
  return {
    id: crypto.randomUUID(),
    appView,
    kind,
    startedAt,
    endedAt,
    durationMs: Math.max(0, endedAt - startedAt),
    dateKey: getDateKey(startedAt),
    hour: getHour(startedAt),
  }
}
