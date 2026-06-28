import { useMemo } from 'react'

import { STOCKS_TILE_ID, useStocksTileStore } from '@/store/stocks-tile-store'
import { useSettingsStore } from '@/store/settings-store'

import { StocksTile } from '../../components/StocksTile'
import type { RegisteredTile } from '../TileRegistry.types'

/**
 * The Stocks tile is conditionally present (user adds it explicitly).
 * Returns `null` when no stocks tile has been created yet.
 *
 * Width is persisted in `useSettingsStore.stocksTileWidth`.
 */
export function useStocksTileEntry(): RegisteredTile | null {
  const stocksTile = useStocksTileStore((s) => s.tile)
  const stocksTileWidth = useSettingsStore((s) => s.stocksTileWidth)
  const setStocksTileWidth = useSettingsStore((s) => s.setStocksTileWidth)

  return useMemo<RegisteredTile | null>(() => {
    if (!stocksTile) return null
    return {
      id: STOCKS_TILE_ID,
      kind: 'stocks',
      width: stocksTileWidth,
      setWidth: setStocksTileWidth,
      render: (handle) => (
        <StocksTile
          tileWidth={stocksTileWidth}
          onWidthChange={setStocksTileWidth}
          dragHandleProps={handle}
        />
      ),
    }
  }, [stocksTile, stocksTileWidth, setStocksTileWidth])
}
