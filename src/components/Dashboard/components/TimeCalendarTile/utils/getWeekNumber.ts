/**
 * Compute the ISO 8601 week number (1–53) for the supplied date.
 * Weeks start on Monday; week 1 is the week containing the first Thursday
 * of the year.
 */
export function getWeekNumber(date: Date): number {
  const target = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  )
  const dayNum = (target.getUTCDay() + 6) % 7
  target.setUTCDate(target.getUTCDate() - dayNum + 3)

  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4))
  const firstDayNum = (firstThursday.getUTCDay() + 6) % 7
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3)

  const msPerWeek = 7 * 24 * 60 * 60 * 1000
  const diff = target.getTime() - firstThursday.getTime()
  return 1 + Math.round(diff / msPerWeek)
}
