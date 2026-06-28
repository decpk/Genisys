import { memo } from 'react'

import { TIME_CALENDAR_TILE_STYLES } from '../../TimeCalendarTile.styles'
import { useTimeCalendarClockData } from './useTimeCalendarClockData'

/**
 * Time & Calendar clock leaf — the ONLY part of the tile that re-renders each
 * second. Owns the per-second ticker and renders the hero time, period/seconds
 * meta, and the greeting · date sub-line.
 *
 * Returns a fragment (no wrapper element) so the parent's `clockSection` flex
 * `gap` spacing between the clock, sub-line, and toggle row is preserved.
 */
export const TimeCalendarClock = memo(
  function TimeCalendarClock(): React.JSX.Element {
    const { clock, greeting, dateLabel } = useTimeCalendarClockData()
    const styles = TIME_CALENDAR_TILE_STYLES

    const clockTime = `${clock.hours}:${clock.minutes}`

    return (
      <>
        <div className={styles.clockBlock}>
          <span className={styles.clockMain}>{clockTime}</span>
          <div className={styles.clockMeta}>
            {clock.period ? (
              <span className={styles.clockPeriod}>{clock.period}</span>
            ) : null}
            <span className={styles.clockSeconds}>{clock.seconds}</span>
          </div>
        </div>

        <div className={styles.subLine}>
          <span className={styles.greetingText}>{greeting}</span>
          {` · ${dateLabel}`}
        </div>
      </>
    )
  },
)
