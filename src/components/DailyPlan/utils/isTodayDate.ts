/**
 * Returns true if the given YYYY-MM-DD date string matches today's date.
 */
export function isTodayDate(dateStr: string): boolean {
  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  return dateStr === today
}
