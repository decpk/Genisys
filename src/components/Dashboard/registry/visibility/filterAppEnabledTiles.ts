import type { AppView } from '@/components/ActivityBar'

import type { RegisteredTile } from '../TileRegistry.types'

import { TILE_ID_TO_APP } from './tileAppOwnership.constants'

/**
 * Filter out tiles whose owner app is currently disabled.
 *
 * A tile is dropped only when its `id` maps to an owner app (see
 * `TILE_ID_TO_APP`) AND that app is not enabled. Tiles with no mapped owner
 * app are always kept. Pure function — safe to call inside `useMemo`.
 */
export function filterAppEnabledTiles(
  tiles: RegisteredTile[],
  isAppEnabled: (app: AppView) => boolean,
): RegisteredTile[] {
  return tiles.filter((t) => {
    const ownerApp = TILE_ID_TO_APP[t.id]
    return ownerApp === undefined || isAppEnabled(ownerApp)
  })
}
