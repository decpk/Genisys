import { formatLocalDate } from './formatLocalDate'
import { parseLocalDateString } from './parseLocalDateString'

export function formatDayLabel(dateStr: string): string {
  const d = parseLocalDateString(dateStr)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  if (dateStr === formatLocalDate(today)) return 'Today'
  if (dateStr === formatLocalDate(yesterday)) return 'Yesterday'
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}
