/**
 * Determine whether a single DND range is currently active.
 *
 * Supports cross-midnight ranges:
 * - `start < end`  → active when `start <= now < end` (e.g. 09:00→17:00).
 * - `start > end`  → wraps past midnight, active when `now >= start || now < end`
 *   (e.g. 22:00→08:00).
 * - `start === end` → zero-length, never active.
 * - Either bound `< 0` → invalid time, never active.
 *
 * `start`, `end`, and `currentMinutes` are all minutes-since-midnight
 * (`0`–`1439`).
 */
export function isInRange(start: number, end: number, currentMinutes: number): boolean {
  if (start < 0 || end < 0) return false
  if (start === end) return false
  if (start < end) {
    return currentMinutes >= start && currentMinutes < end
  }
  return currentMinutes >= start || currentMinutes < end
}
