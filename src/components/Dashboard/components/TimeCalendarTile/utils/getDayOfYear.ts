/**
 * Compute the 1-based day of the year (1–366) for the supplied date.
 */
export function getDayOfYear(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 0)
  const msPerDay = 24 * 60 * 60 * 1000
  const diff = date.getTime() - startOfYear.getTime()
  return Math.floor(diff / msPerDay)
}
