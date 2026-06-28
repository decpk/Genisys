import { useMemo } from 'react'

import { useSettingsStore } from '@/store/settings-store'

import { TimeCalendarTile } from '../../components/TimeCalendarTile'
import { TIME_CALENDAR_TILE_ID } from '../tile-ids.constants'
import type { RegisteredTile } from '../TileRegistry.types'

/**
 * Time & Calendar tile — singleton, default-shown.
 *
 * Width is persisted in `useSettingsStore.timeCalendarTileWidth`.
 */
export function useTimeCalendarTileEntry(): RegisteredTile {
  const width = useSettingsStore((s) => s.timeCalendarTileWidth)
  const setWidth = useSettingsStore((s) => s.setTimeCalendarTileWidth)

  return useMemo<RegisteredTile>(() => {
    return {
      id: TIME_CALENDAR_TILE_ID,
      kind: 'time-calendar',
      width,
      setWidth,
      render: (handle) => (
        <TimeCalendarTile
          tileWidth={width}
          onWidthChange={setWidth}
          dragHandleProps={handle}
        />
      ),
    }
  }, [width, setWidth])
}
