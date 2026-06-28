import { useNewsTileStore } from '@/store/news-tile-store'
import { useStocksTileStore } from '@/store/stocks-tile-store'

import type { DashboardHeaderProps } from '../components/DashboardHeader/DashboardHeader.types'

interface UseDashboardHeaderPropsOptions {
  /** Open the LiveSportsDialog. */
  openLiveSportsDialog: () => void
}

/**
 * Derives the prop bag passed to `DashboardHeader`.
 */
export function useDashboardHeaderProps(
  opts: UseDashboardHeaderPropsOptions
): DashboardHeaderProps {
  const { openLiveSportsDialog } = opts

  const newsTile = useNewsTileStore((s) => s.tile)
  const createNewsTile = useNewsTileStore((s) => s.createTile)
  const stocksTile = useStocksTileStore((s) => s.tile)
  const createStocksTile = useStocksTileStore((s) => s.createTile)

  return {
    onAddNews: createNewsTile,
    onAddStocks: createStocksTile,
    onAddLiveSports: openLiveSportsDialog,
    newsTileExists: newsTile !== null,
    stocksTileExists: stocksTile !== null,
  }
}
