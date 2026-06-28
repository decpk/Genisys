/**
 * Format a `Date` as a "Month Year" label, e.g. "June 2026".
 */
export function getMonthLabel(date: Date): string {
  return date.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })
}
