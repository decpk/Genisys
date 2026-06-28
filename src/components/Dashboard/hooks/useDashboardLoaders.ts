import { useEffect } from 'react'

import { useLiveScoresStore } from '@/store/live-scores-store'
import { useNewsTileStore } from '@/store/news-tile-store'
import { useStocksTileStore } from '@/store/stocks-tile-store'

/**
 * Triggers the once-per-app load of every store the dashboard depends on.
 * Each `loadXxx` action is internally idempotent (no-op if already loaded).
 */
export function useDashboardLoaders(): void {
  const loadSportTiles = useLiveScoresStore((s) => s.loadTiles)
  const loadNewsTile = useNewsTileStore((s) => s.loadAll)
  const loadStocksTile = useStocksTileStore((s) => s.loadAll)

  useEffect(() => {
    loadSportTiles()
    loadNewsTile()
    loadStocksTile()
  }, [loadSportTiles, loadNewsTile, loadStocksTile])
}
