import { useMemo } from 'react'

import type { MonthCalendarData } from './MonthCalendar.types'
import { buildMonthCells } from './utils/buildMonthCells'
import { formatMonthYear } from './utils/formatMonthYear'
import { getWeekdayLabels } from './utils/getWeekdayLabels'
import { toLocalDateKey } from './utils/toLocalDateKey'

export function useMonthCalendarData(now: Date): MonthCalendarData {
  // Memoize cells by year-month-day so they only recompute when the local
  // DATE changes — not on every tick. This keeps `isToday` correct at local
  // midnight without recomputing 42 cells every second.
  const year = now.getFullYear()
  const month = now.getMonth()
  const dateKey = toLocalDateKey(now)
  const monthKey = `${year}-${month}-${dateKey}`

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cells = useMemo(() => buildMonthCells(now), [monthKey])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const monthYearLabel = useMemo(() => formatMonthYear(now), [year, month])
  const weekdayLabels = useMemo(() => getWeekdayLabels(), [])

  return { cells, monthYearLabel, weekdayLabels }
}
