import { useMemo } from 'react'

import { getDayCellClassName } from './utils/getDayCellClassName'
import type { MonthGridCell } from '../../TimeCalendarTile.types'
import type { TimeCalendarMonthGridCellView } from './TimeCalendarMonthGrid.types'

/**
 * Annotate each raw month-grid cell with its resolved class name so the view
 * can render a flat list without computing styles inline.
 */
export function useTimeCalendarMonthGridData(
  monthCells: MonthGridCell[],
): TimeCalendarMonthGridCellView[] {
  return useMemo(
    () =>
      monthCells.map((cell) => ({
        key: cell.key,
        day: cell.day,
        className: getDayCellClassName(cell),
      })),
    [monthCells],
  )
}
