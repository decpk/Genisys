import type { TimerPersistedShape } from '../timer-store.types'

const LEGACY_KEY = 'genisys:focus-timer:v1'

interface LegacyAggregates {
  todaysCompletedSessions: number
  todaysFocusMinutes: number
  weeklyMinutes: number[]
}

/**
 * One-time migration of the legacy `focus-timer` store's aggregate counters
 * into the new Timer store.
 *
 * Runs only when the new Timer store has nothing persisted yet AND the
 * legacy localStorage key exists. Returns the imported aggregates (or
 * `null` if no migration occurred). On success, the legacy key is removed
 * so subsequent hydrates skip this path.
 */
export function migrateLegacyFocusTimer(
  existing: TimerPersistedShape | null,
): LegacyAggregates | null {
  if (existing) return null
  try {
    const raw = localStorage.getItem(LEGACY_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<LegacyAggregates>
    const out: LegacyAggregates = {
      todaysCompletedSessions: Number(parsed.todaysCompletedSessions ?? 0) || 0,
      todaysFocusMinutes: Number(parsed.todaysFocusMinutes ?? 0) || 0,
      weeklyMinutes: Array.isArray(parsed.weeklyMinutes)
        ? parsed.weeklyMinutes.slice(0, 7).map((n) => Number(n) || 0)
        : [0, 0, 0, 0, 0, 0, 0],
    }
    while (out.weeklyMinutes.length < 7) out.weeklyMinutes.push(0)
    localStorage.removeItem(LEGACY_KEY)
    return out
  } catch {
    return null
  }
}
