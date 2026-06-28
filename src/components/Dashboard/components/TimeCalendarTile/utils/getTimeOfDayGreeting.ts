/**
 * Resolve a friendly greeting for the supplied moment based on its hour.
 *   05:00–11:59 → "Good morning"
 *   12:00–16:59 → "Good afternoon"
 *   17:00–20:59 → "Good evening"
 *   otherwise   → "Good night"
 */
export function getTimeOfDayGreeting(date: Date): string {
  const hour = date.getHours()
  if (hour >= 5 && hour < 12) return 'Good morning'
  if (hour >= 12 && hour < 17) return 'Good afternoon'
  if (hour >= 17 && hour < 21) return 'Good evening'
  return 'Good night'
}
