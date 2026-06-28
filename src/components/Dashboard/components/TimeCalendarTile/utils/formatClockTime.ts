import type { ClockParts } from '../TimeCalendarTile.types'

/**
 * Split a `Date` into the display parts for the digital clock.
 *
 * - 24-hour: `hours` is "00"–"23", `period` is "".
 * - 12-hour: `hours` is "1"–"12", `period` is "AM"/"PM".
 * - `minutes` and `seconds` are always zero-padded to two digits.
 */
export function formatClockTime(date: Date, use24Hour: boolean): ClockParts {
  const rawHours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  if (use24Hour) {
    return {
      hours: String(rawHours).padStart(2, '0'),
      minutes,
      seconds,
      period: '',
    }
  }

  let period: string
  if (rawHours >= 12) period = 'PM'
  else period = 'AM'

  let twelveHour = rawHours % 12
  if (twelveHour === 0) twelveHour = 12

  return {
    hours: String(twelveHour),
    minutes,
    seconds,
    period,
  }
}
