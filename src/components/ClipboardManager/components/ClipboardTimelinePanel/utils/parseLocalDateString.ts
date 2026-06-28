// Parse an ISO date-only string (YYYY-MM-DD) as a local Date at noon to avoid
// timezone edge cases that can shift the day when constructing from midnight.
export function parseLocalDateString(dateStr: string): Date {
  return new Date(dateStr + 'T12:00:00')
}
