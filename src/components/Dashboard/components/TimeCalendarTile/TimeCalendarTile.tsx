import { memo } from 'react'
import { Clock, GripVertical } from 'lucide-react'

import { IconButton } from '@/components/ui/icon-button'
import { Switch } from '@/components/ui/switch'

import { TileResizeMenu } from '../TileResizeMenu'
import { TimeCalendarClock } from './components/TimeCalendarClock'
import { TimeCalendarMonthGrid } from './components/TimeCalendarMonthGrid'
import {
  CLOCK_FORMAT_TOGGLE_LABEL,
  TIME_CALENDAR_DRAG_LABEL,
  TIME_CALENDAR_RESIZE_LABEL,
  TIME_CALENDAR_TILE_TITLE,
  TIME_CALENDAR_TOGGLE_TEXT,
} from './TimeCalendarTile.constants'
import { TIME_CALENDAR_TILE_STYLES } from './TimeCalendarTile.styles'
import { useTimeCalendarTileData } from './useTimeCalendarTileData'
import type { TimeCalendarTileProps } from './TimeCalendarTile.types'

export const TimeCalendarTile = memo(function TimeCalendarTile(
  props: TimeCalendarTileProps,
): React.JSX.Element {
  const { tileWidth, onWidthChange, dragHandleProps } = props
  const data = useTimeCalendarTileData()
  const styles = TIME_CALENDAR_TILE_STYLES

  const footerText = `Week ${data.weekNumber} · Day ${data.dayOfYear} of ${data.year}`

  return (
    <div className={styles.shell}>
      {/* Action buttons — top-right, shown on hover */}
      <div className={styles.actions}>
        <TileResizeMenu
          tileWidth={tileWidth}
          onWidthChange={onWidthChange}
          tooltipLabel={TIME_CALENDAR_RESIZE_LABEL}
        />
        <IconButton
          tooltip={TIME_CALENDAR_DRAG_LABEL}
          tooltipSide="bottom"
          size="xs"
          className={styles.dragHandle}
          {...dragHandleProps.attributes}
          {...dragHandleProps.listeners}
        >
          <GripVertical size={14} />
        </IconButton>
      </div>

      {/* Header — flat icon + quiet section label */}
      <div className={styles.header}>
        <span className={styles.iconChip}>
          <Clock size={13} className={styles.iconChipIcon} />
        </span>
        <span className={styles.title}>{TIME_CALENDAR_TILE_TITLE}</span>
      </div>

      {/* Clock — per-second hero time + greeting · date, isolated in its own
          leaf so the 1 Hz tick re-renders only the clock, not the whole tile. */}
      <div className={styles.clockSection}>
        <TimeCalendarClock />

        <div className={styles.toggleRow}>
          <span className={styles.toggleLabel}>{TIME_CALENDAR_TOGGLE_TEXT}</span>
          <Switch
            checked={data.use24Hour}
            onCheckedChange={data.toggleClockFormat}
            aria-label={CLOCK_FORMAT_TOGGLE_LABEL}
          />
        </div>
      </div>

      {/* Calendar */}
      <div className={styles.calendarSection}>
        <span className={styles.monthLabel}>{data.monthLabel}</span>
        <TimeCalendarMonthGrid
          monthCells={data.monthCells}
          weekdayHeaders={data.weekdayHeaders}
        />
      </div>

      {/* Footer stats */}
      <div className={styles.footer}>{footerText}</div>
    </div>
  )
})
