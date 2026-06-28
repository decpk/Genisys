import { useMemo } from 'react'

import { useNewsTileStore, NEWS_TILE_ID } from '@/store/news-tile-store'
import { useSettingsStore } from '@/store/settings-store'

import { NewsTile } from '../../components/NewsTile'
import type { RegisteredTile } from '../TileRegistry.types'

/**
 * The News tile is conditionally present (user adds it explicitly).
 * Returns `null` when no news tile has been created yet.
 *
 * Width is persisted in `useSettingsStore.newsTileWidth`.
 */
export function useNewsTileEntry(): RegisteredTile | null {
  const newsTile = useNewsTileStore((s) => s.tile)
  const newsTileWidth = useSettingsStore((s) => s.newsTileWidth)
  const setNewsTileWidth = useSettingsStore((s) => s.setNewsTileWidth)

  return useMemo<RegisteredTile | null>(() => {
    if (!newsTile) return null
    return {
      id: NEWS_TILE_ID,
      kind: 'news',
      width: newsTileWidth,
      setWidth: setNewsTileWidth,
      render: (handle) => (
        <NewsTile
          tileWidth={newsTileWidth}
          onWidthChange={setNewsTileWidth}
          dragHandleProps={handle}
        />
      ),
    }
  }, [newsTile, newsTileWidth, setNewsTileWidth])
}
