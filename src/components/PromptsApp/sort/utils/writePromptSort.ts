import { PROMPT_SORT_STORAGE_KEY } from '../PromptsAppSort.constants'
import type { PromptSortOption } from '../PromptsAppSort.types'

/**
 * Persist the Prompts-library sort option to localStorage. Silently
 * ignores failures (storage disabled / quota exceeded).
 */
export function writePromptSort(option: PromptSortOption): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(PROMPT_SORT_STORAGE_KEY, option)
  } catch {
    // Ignore persistence failures.
  }
}
