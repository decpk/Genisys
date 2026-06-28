import { cn } from '@/lib/utils'

import type { MonthGridCell } from '../../../TimeCalendarTile.types'
import { TIME_CALENDAR_MONTH_GRID_STYLES } from '../TimeCalendarMonthGrid.styles'

/**
 * Resolve the class name for a single month-grid day cell. The current day
 * takes precedence over the muted other-month styling, which in turn takes
 * precedence over the lighter weekend (Sat/Sun) styling.
 */
export function getDayCellClassName(cell: MonthGridCell): string {
  const styles = TIME_CALENDAR_MONTH_GRID_STYLES
  if (cell.isToday) return cn(styles.dayCell, styles.dayCellToday)
  if (!cell.isCurrentMonth) return cn(styles.dayCell, styles.dayCellMuted)
  if (cell.isWeekend) return cn(styles.dayCell, styles.dayCellWeekend)
  return styles.dayCell
}
