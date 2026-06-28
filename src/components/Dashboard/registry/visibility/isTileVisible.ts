import { getTileVisibilityKey } from './getTileVisibilityKey'

/**
 * Pure check: is the given tile currently visible?
 *
 * Visibility defaults to `true` when no entry exists in the map — this keeps
 * the feature backward compatible with users who upgraded from a build that
 * did not persist `tileVisibility`.
 */
export function isTileVisible(
  tileId: string,
  visibility: Record<string, boolean>,
): boolean {
  const key = getTileVisibilityKey(tileId)
  return visibility[key] !== false
}
