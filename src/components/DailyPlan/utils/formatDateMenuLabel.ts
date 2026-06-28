/** Format 'YYYY-MM-DD' to 'Sat, May 9' (no year) for use in menu labels */
export function formatDateMenuLabel(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}
