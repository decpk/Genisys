import { memo } from 'react'

import { TIME_CALENDAR_MONTH_GRID_STYLES } from './TimeCalendarMonthGrid.styles'
import { useTimeCalendarMonthGridData } from './useTimeCalendarMonthGridData'
import { getWeekdayHeaderClassName } from './utils/getWeekdayHeaderClassName'
import type { TimeCalendarMonthGridProps } from './TimeCalendarMonthGrid.types'

export const TimeCalendarMonthGrid = memo(function TimeCalendarMonthGrid(
  props: TimeCalendarMonthGridProps,
): React.JSX.Element {
  const { monthCells, weekdayHeaders } = props
  const cells = useTimeCalendarMonthGridData(monthCells)
  const styles = TIME_CALENDAR_MONTH_GRID_STYLES

  return (
    <div className={styles.wrap}>
      <div className={styles.weekdayRow}>
        {weekdayHeaders.map((label, index) => (
          <span key={label} className={getWeekdayHeaderClassName(index)}>
            {label}
          </span>
        ))}
      </div>
      <div className={styles.dayGrid}>
        {cells.map((cell) => (
          <span key={cell.key} className={cell.className}>
            {cell.day}
          </span>
        ))}
      </div>
    </div>
  )
})
