import {
  PROMPTS_APP_CATEGORY_RAIL_DEFAULT_WIDTH,
  PROMPTS_APP_CATEGORY_RAIL_MAX_WIDTH,
  PROMPTS_APP_CATEGORY_RAIL_MIN_WIDTH,
  PROMPTS_APP_CATEGORY_RAIL_STORAGE_KEY,
} from '../PromptsAppCategoryRail.constants'

/**
 * Read the persisted category-rail width from localStorage. Returns
 * the default width when no value is persisted or when the persisted
 * value is invalid / out of range. Safe to call on the server (returns
 * the default) — `window` is referenced defensively.
 */
export function readCategoryRailWidth(): number {
  if (typeof window === 'undefined') {
    return PROMPTS_APP_CATEGORY_RAIL_DEFAULT_WIDTH
  }
  try {
    const raw = window.localStorage.getItem(
      PROMPTS_APP_CATEGORY_RAIL_STORAGE_KEY,
    )
    if (!raw) return PROMPTS_APP_CATEGORY_RAIL_DEFAULT_WIDTH
    const parsed = parseInt(raw, 10)
    if (Number.isNaN(parsed)) return PROMPTS_APP_CATEGORY_RAIL_DEFAULT_WIDTH
    if (parsed < PROMPTS_APP_CATEGORY_RAIL_MIN_WIDTH) {
      return PROMPTS_APP_CATEGORY_RAIL_MIN_WIDTH
    }
    if (parsed > PROMPTS_APP_CATEGORY_RAIL_MAX_WIDTH) {
      return PROMPTS_APP_CATEGORY_RAIL_MAX_WIDTH
    }
    return parsed
  } catch {
    return PROMPTS_APP_CATEGORY_RAIL_DEFAULT_WIDTH
  }
}
