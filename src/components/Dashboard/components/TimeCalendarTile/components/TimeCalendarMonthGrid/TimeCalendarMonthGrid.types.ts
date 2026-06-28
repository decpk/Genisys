import type { MonthGridCell } from '../../TimeCalendarTile.types'

export interface TimeCalendarMonthGridProps {
  monthCells: MonthGridCell[]
  weekdayHeaders: readonly string[]
}

/** A grid cell annotated with its resolved class name, ready to render. */
export interface TimeCalendarMonthGridCellView {
  key: string
  day: number
  className: string
}
