import { useMemo } from 'react'

import { useSettingsStore } from '@/store/settings-store'

import { TimerTile } from '../../components/TimerTile'
import { TIMER_TILE_ID } from '../tile-ids.constants'
import type { RegisteredTile } from '../TileRegistry.types'

/**
 * Timer tile — singleton, default-shown.
 *
 * Width is persisted in `useSettingsStore.timerTileWidth`.
 */
export function useTimerTileEntry(): RegisteredTile {
  const width = useSettingsStore((s) => s.timerTileWidth)
  const setWidth = useSettingsStore((s) => s.setTimerTileWidth)

  return useMemo<RegisteredTile>(() => {
    return {
      id: TIMER_TILE_ID,
      kind: 'timer',
      width,
      setWidth,
      render: (handle) => (
        <TimerTile
          tileWidth={width}
          onWidthChange={setWidth}
          dragHandleProps={handle}
        />
      ),
    }
  }, [width, setWidth])
}
