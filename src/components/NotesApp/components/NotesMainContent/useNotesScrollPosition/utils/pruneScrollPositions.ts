import type { ScrollPositionMap } from '../useNotesScrollPosition.types'

/** Returns a copy of the map limited to the last `max` entries (insertion order), dropping the oldest. */
export function pruneScrollPositions(map: ScrollPositionMap, max: number): ScrollPositionMap {
  if (max <= 0) {
    return {}
  }

  const keys = Object.keys(map)
  if (keys.length <= max) {
    return { ...map }
  }

  const result: ScrollPositionMap = {}
  for (const key of keys.slice(keys.length - max)) {
    result[key] = map[key]
  }

  return result
}
