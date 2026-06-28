/**
 * Returns the new streak count given the previous streak, today's date
 * key, and the day key of the most recently logged session.
 *
 * - If a session was logged today and yesterday → streak continues.
 * - If today is the first session and prev was yesterday → streak + 1.
 * - If the gap > 1 day → streak resets to 1 (today's first session).
 * - If no prior session ever → streak becomes 1.
 */
export function recomputeStreak(
  prevStreak: number,
  todayKey: string,
  lastSessionDayKey: string | null,
): number {
  if (!lastSessionDayKey) return 1
  if (lastSessionDayKey === todayKey) {
    return Math.max(prevStreak, 1)
  }

  const today = new Date(todayKey)
  const last = new Date(lastSessionDayKey)
  if (Number.isNaN(today.getTime()) || Number.isNaN(last.getTime())) {
    return 1
  }
  const diffDays = Math.round(
    (today.getTime() - last.getTime()) / 86_400_000,
  )

  if (diffDays === 1) return prevStreak + 1
  if (diffDays <= 0) return Math.max(prevStreak, 1)
  return 1
}
