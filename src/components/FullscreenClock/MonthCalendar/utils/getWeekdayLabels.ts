const WEEKDAY_FORMATTER = new Intl.DateTimeFormat(undefined, { weekday: 'short' })
// Jan 7 2024 is a Sunday (used purely as a reference Date)
const SUNDAY_REFERENCE_YEAR = 2024
const SUNDAY_REFERENCE_MONTH = 0
const SUNDAY_REFERENCE_DAY = 7

export function getWeekdayLabels(): string[] {
  const labels: string[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(SUNDAY_REFERENCE_YEAR, SUNDAY_REFERENCE_MONTH, SUNDAY_REFERENCE_DAY + i)
    labels.push(WEEKDAY_FORMATTER.format(d))
  }
  return labels
}
