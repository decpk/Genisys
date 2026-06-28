import { SCROLL_POSITION_STORAGE_KEY } from '../useNotesScrollPosition.constants'
import type { ScrollPositionMap } from '../useNotesScrollPosition.types'

/** Reads the persisted note-id -> scrollTop map from localStorage. Safe against malformed JSON. */
export function readScrollPositions(): ScrollPositionMap {
  try {
    const raw = localStorage.getItem(SCROLL_POSITION_STORAGE_KEY)
    if (!raw) {
      return {}
    }

    const parsed: unknown = JSON.parse(raw)
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return {}
    }

    const result: ScrollPositionMap = {}
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof value === 'number' && Number.isFinite(value)) {
        result[key] = value
      }
    }

    return result
  } catch {
    return {}
  }
}
