const FORMATTER = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' })

export function formatMonthYear(date: Date): string {
  return FORMATTER.format(date)
}
