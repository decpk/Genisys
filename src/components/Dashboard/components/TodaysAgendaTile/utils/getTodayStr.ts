/**
 * Returns today's local date as a `YYYY-MM-DD` string — matching the
 * key format used by `useDailyPlanStore.tasks` / `.meetings`.
 */
export function getTodayStr(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
