import { TIME_CALENDAR_MONTH_GRID_STYLES } from '../TimeCalendarMonthGrid.styles'

/**
 * Resolve the class name for a weekday header cell. The grid is Sunday-first,
 * so column index `0` (Sun) and `6` (Sat) are the weekend columns and get the
 * lighter/greyed styling.
 */
export function getWeekdayHeaderClassName(index: number): string {
  const styles = TIME_CALENDAR_MONTH_GRID_STYLES
  const isWeekend = index === 0 || index === 6
  if (isWeekend) return styles.weekdayCellWeekend
  return styles.weekdayCell
}
