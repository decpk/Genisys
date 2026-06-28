/**
 * Format a `Date` as a long human-readable date string,
 * e.g. "Friday, June 12, 2026".
 */
export function formatClockDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
