import type { UsageSegmentKind } from '../usage.types'
import { saveUsageSession } from '../api/saveUsageSession'
import { buildUsageRow } from './buildUsageRow'
import { splitAtMidnight } from './splitAtMidnight'

/**
 * Foreground segments shorter than this are dropped. Rapidly cycling apps
 * (e.g. holding Cmd+Tab) would otherwise emit a write + row per sub-second
 * glance — pure IPC/DB churn that isn't meaningful "usage". Open and session
 * segments are never coalesced (they are long-lived).
 */
const FOREGROUND_MIN_MS = 1_000

/**
 * Splits a segment at LOCAL midnight boundaries, builds a row per piece, and
 * persists each fire-and-forget. Zero/negative-duration spans are skipped, as
 * are sub-second foreground glances (see {@link FOREGROUND_MIN_MS}). Never
 * throws — persistence errors are swallowed so event handlers stay safe.
 */
export function persistSegment(
  kind: UsageSegmentKind,
  appView: string | null,
  startedAt: number,
  endedAt: number,
): void {
  if (endedAt <= startedAt) return
  if (kind === 'foreground' && endedAt - startedAt < FOREGROUND_MIN_MS) return
  for (const piece of splitAtMidnight(startedAt, endedAt)) {
    if (piece.endedAt <= piece.startedAt) continue
    const row = buildUsageRow({
      kind,
      appView,
      startedAt: piece.startedAt,
      endedAt: piece.endedAt,
    })
    try {
      void saveUsageSession(row).catch(() => {})
    } catch {
      // swallow — usage tracking must never disrupt the app
    }
  }
}
