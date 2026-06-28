import {
  LIVE_SPORTS_VISIBILITY_KEY,
  SPORTS_TILE_ID_PREFIX,
} from './visibility.constants'

/**
 * Resolve the *visibility key* used to look up a tile's show/hide state.
 *
 * For most tiles the key is the tile id itself. Live Sports tiles share a
 * single grouped key so they toggle as one unit.
 */
export function getTileVisibilityKey(tileId: string): string {
  if (tileId.startsWith(SPORTS_TILE_ID_PREFIX)) return LIVE_SPORTS_VISIBILITY_KEY
  return tileId
}
