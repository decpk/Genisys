import { toTimerDate } from './toTimerDate'

export function formatSessionTime(timestamp: number | string): string {
  const d = toTimerDate(timestamp)
  if (Number.isNaN(d.getTime())) return ''
  const h = d.getHours().toString().padStart(2, '0')
  const m = d.getMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
}
