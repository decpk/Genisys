import type { TimeParts } from '../FullscreenClock.types'

export function getTimeParts(date: Date): TimeParts {
  let hours = date.getHours()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  if (hours === 0) hours = 12
  return {
    hh: String(hours).padStart(2, '0'),
    mm: String(date.getMinutes()).padStart(2, '0'),
    ss: String(date.getSeconds()).padStart(2, '0'),
    ampm,
  }
}
