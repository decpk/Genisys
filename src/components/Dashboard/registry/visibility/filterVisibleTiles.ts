import type { RegisteredTile } from '../TileRegistry.types'

import { isTileVisible } from './isTileVisible'

/**
 * Filter a flat list of tiles down to those currently marked visible.
 * Pure function — safe to call inside `useMemo`.
 */
export function filterVisibleTiles(
  tiles: RegisteredTile[],
  visibility: Record<string, boolean>,
): RegisteredTile[] {
  return tiles.filter((t) => isTileVisible(t.id, visibility))
}
