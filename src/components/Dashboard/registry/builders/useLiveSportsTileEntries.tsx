import { useMemo } from 'react'

import { useLiveScoresStore } from '@/store/live-scores-store'

import { LiveSportScoreTile } from '../../components/LiveSportsTile'
import type { RegisteredTile } from '../TileRegistry.types'

/**
 * Builds one `RegisteredTile` per configured live-sports tile.
 *
 * Width changes are currently a no-op (preserves pre-refactor behavior);
 * each `LiveSportTileConfig` carries its own `tileWidth` field that the
 * tile manages internally.
 */
export function useLiveSportsTileEntries(): RegisteredTile[] {
  const sportTiles = useLiveScoresStore((s) => s.tiles)

  return useMemo<RegisteredTile[]>(() => {
    return sportTiles.map((tile) => ({
      id: tile.id,
      kind: 'live-sports',
      width: tile.tileWidth,
      setWidth: () => {},
      render: (handle) => (
        <LiveSportScoreTile tile={tile} dragHandleProps={handle} />
      ),
    }))
  }, [sportTiles])
}
