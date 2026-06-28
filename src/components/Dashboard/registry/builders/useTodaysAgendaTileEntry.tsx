import { useMemo } from 'react'

import { useSettingsStore } from '@/store/settings-store'

import { TodaysAgendaTile } from '../../components/TodaysAgendaTile'
import { TODAYS_AGENDA_TILE_ID } from '../tile-ids.constants'
import type { RegisteredTile } from '../TileRegistry.types'

/**
 * Today's Agenda tile — singleton, default-shown.
 *
 * Width is persisted in `useSettingsStore.todaysAgendaTileWidth`.
 */
export function useTodaysAgendaTileEntry(): RegisteredTile {
  const todaysAgendaTileWidth = useSettingsStore((s) => s.todaysAgendaTileWidth)
  const setTodaysAgendaTileWidth = useSettingsStore((s) => s.setTodaysAgendaTileWidth)

  return useMemo<RegisteredTile>(() => {
    return {
      id: TODAYS_AGENDA_TILE_ID,
      kind: 'todays-agenda',
      width: todaysAgendaTileWidth,
      setWidth: setTodaysAgendaTileWidth,
      render: (handle) => (
        <TodaysAgendaTile
          tileWidth={todaysAgendaTileWidth}
          onWidthChange={setTodaysAgendaTileWidth}
          dragHandleProps={handle}
        />
      ),
    }
  }, [todaysAgendaTileWidth, setTodaysAgendaTileWidth])
}
