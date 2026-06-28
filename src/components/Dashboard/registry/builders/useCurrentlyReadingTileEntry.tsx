import { useMemo } from 'react'

import { useSettingsStore } from '@/store/settings-store'

import { CurrentlyReadingTile } from '../../components/CurrentlyReadingTile'
import { CURRENTLY_READING_TILE_ID } from '../tile-ids.constants'
import type { RegisteredTile } from '../TileRegistry.types'

/**
 * Currently Reading tile — singleton, default-shown.
 *
 * Width is persisted in `useSettingsStore.currentlyReadingTileWidth`.
 */
export function useCurrentlyReadingTileEntry(): RegisteredTile {
  const currentlyReadingTileWidth = useSettingsStore((s) => s.currentlyReadingTileWidth)
  const setCurrentlyReadingTileWidth = useSettingsStore((s) => s.setCurrentlyReadingTileWidth)

  return useMemo<RegisteredTile>(() => {
    return {
      id: CURRENTLY_READING_TILE_ID,
      kind: 'currently-reading',
      width: currentlyReadingTileWidth,
      setWidth: setCurrentlyReadingTileWidth,
      render: (handle) => (
        <CurrentlyReadingTile
          tileWidth={currentlyReadingTileWidth}
          onWidthChange={setCurrentlyReadingTileWidth}
          dragHandleProps={handle}
        />
      ),
    }
  }, [currentlyReadingTileWidth, setCurrentlyReadingTileWidth])
}
