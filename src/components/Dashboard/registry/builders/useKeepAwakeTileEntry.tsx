import { useMemo } from 'react'

import { useSettingsStore } from '@/store/settings-store'

import { KeepAwakeTile } from '../../components/KeepAwakeTile'
import { KEEP_AWAKE_TILE_ID } from '../tile-ids.constants'
import type { RegisteredTile } from '../TileRegistry.types'

/**
 * Stay Awake tile — singleton, default-shown.
 *
 * Width is persisted in `useSettingsStore.keepAwakeTileWidth`.
 */
export function useKeepAwakeTileEntry(): RegisteredTile {
  const width = useSettingsStore((s) => s.keepAwakeTileWidth)
  const setWidth = useSettingsStore((s) => s.setKeepAwakeTileWidth)

  return useMemo<RegisteredTile>(() => {
    return {
      id: KEEP_AWAKE_TILE_ID,
      kind: 'keep-awake',
      width,
      setWidth,
      render: (handle) => (
        <KeepAwakeTile
          tileWidth={width}
          onWidthChange={setWidth}
          dragHandleProps={handle}
        />
      ),
    }
  }, [width, setWidth])
}
