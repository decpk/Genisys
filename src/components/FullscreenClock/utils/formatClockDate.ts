const DATE_FORMATTER = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

export function formatClockDate(date: Date): string {
  return DATE_FORMATTER.format(date)
}
