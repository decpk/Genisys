/** Sums an array of minutes; returns 0 for empty input. */
export function computeWeeklyTotal(weekly: number[]): number {
  return weekly.reduce((acc, n) => acc + (n || 0), 0)
}
