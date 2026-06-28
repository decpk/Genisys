/** Returns the 1-based day-of-year for the supplied local date. */
export function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0)
  const diffMs = date.getTime() - start.getTime()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}
