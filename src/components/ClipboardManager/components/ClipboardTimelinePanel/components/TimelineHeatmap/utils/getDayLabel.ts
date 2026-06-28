import { parseLocalDateString } from '../../../utils/parseLocalDateString'

export function getDayLabel(dateStr: string): string {
  const d = parseLocalDateString(dateStr)
  return d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3)
}

export function getShortDateLabel(dateStr: string): string {
  const d = parseLocalDateString(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function getFullDateLabel(dateStr: string): string {
  const d = parseLocalDateString(dateStr)
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}
