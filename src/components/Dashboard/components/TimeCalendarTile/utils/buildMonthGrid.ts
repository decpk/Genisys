import type { MonthGridCell } from '../TimeCalendarTile.types'

/**
 * Build a flat 42-cell (6 weeks × 7 days) calendar grid for the month
 * containing `date`. The grid always starts on a Sunday and may include
 * trailing/leading days from the adjacent months (flagged via
 * `isCurrentMonth`). `isToday` is compared against the real current date.
 */
export function buildMonthGrid(date: Date): MonthGridCell[] {
  const year = date.getFullYear()
  const month = date.getMonth()

  const firstOfMonth = new Date(year, month, 1)
  const startWeekday = firstOfMonth.getDay()
  const gridStart = new Date(year, month, 1 - startWeekday)

  const today = new Date()
  const todayYear = today.getFullYear()
  const todayMonth = today.getMonth()
  const todayDate = today.getDate()

  const cells: MonthGridCell[] = []
  for (let i = 0; i < 42; i++) {
    const cellDate = new Date(
      gridStart.getFullYear(),
      gridStart.getMonth(),
      gridStart.getDate() + i,
    )
    const cellYear = cellDate.getFullYear()
    const cellMonth = cellDate.getMonth()
    const cellDay = cellDate.getDate()

    const isCurrentMonth = cellMonth === month && cellYear === year
    const isToday =
      cellYear === todayYear &&
      cellMonth === todayMonth &&
      cellDay === todayDate
    const weekday = cellDate.getDay()
    const isWeekend = weekday === 0 || weekday === 6
    const key = `${cellYear}-${String(cellMonth + 1).padStart(2, '0')}-${String(cellDay).padStart(2, '0')}`

    cells.push({ day: cellDay, isCurrentMonth, isToday, isWeekend, key })
  }

  return cells
}
