import type { MonthCalendarCell } from '../MonthCalendar.types'

import { toLocalDateKey } from './toLocalDateKey'

const TOTAL_CELLS = 42

export function buildMonthCells(now: Date): MonthCalendarCell[] {
  const year = now.getFullYear()
  const month = now.getMonth()

  // First day of current month, then walk back to the Sunday on or before it.
  const firstOfMonth = new Date(year, month, 1)
  const firstDayOfWeek = firstOfMonth.getDay() // 0 = Sunday
  const gridStart = new Date(year, month, 1 - firstDayOfWeek)

  const todayKey = toLocalDateKey(now)

  const cells: MonthCalendarCell[] = []
  for (let i = 0; i < TOTAL_CELLS; i++) {
    const cellDate = new Date(
      gridStart.getFullYear(),
      gridStart.getMonth(),
      gridStart.getDate() + i,
    )
    const cellKey = toLocalDateKey(cellDate)
    cells.push({
      key: cellKey,
      label: String(cellDate.getDate()),
      isCurrentMonth: cellDate.getMonth() === month,
      isToday: cellKey === todayKey,
    })
  }

  return cells
}
