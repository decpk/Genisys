import { format } from 'date-fns'

export function formatTimeToString(date: Date): string {
  return format(date, 'HH:mm')
}
