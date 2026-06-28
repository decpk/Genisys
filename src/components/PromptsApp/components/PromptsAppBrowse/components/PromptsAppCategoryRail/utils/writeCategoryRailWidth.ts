import { PROMPTS_APP_CATEGORY_RAIL_STORAGE_KEY } from '../PromptsAppCategoryRail.constants'

/**
 * Persist the category-rail width to localStorage. Silently swallows
 * exceptions (private-browsing / storage-disabled environments).
 */
export function writeCategoryRailWidth(width: number): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(
      PROMPTS_APP_CATEGORY_RAIL_STORAGE_KEY,
      String(Math.round(width)),
    )
  } catch {
    // ignore — width persistence is best-effort
  }
}
