import {
  DEFAULT_PROMPT_SORT,
  PROMPT_SORT_OPTIONS,
  PROMPT_SORT_STORAGE_KEY,
} from '../PromptsAppSort.constants'
import type { PromptSortOption } from '../PromptsAppSort.types'

/**
 * Read the persisted Prompts-library sort option from localStorage.
 * Falls back to the default when nothing is stored or the value is
 * invalid. Safe to call on the server (`window` checked defensively).
 */
export function readPromptSort(): PromptSortOption {
  if (typeof window === 'undefined') return DEFAULT_PROMPT_SORT
  try {
    const raw = window.localStorage.getItem(PROMPT_SORT_STORAGE_KEY)
    if (!raw) return DEFAULT_PROMPT_SORT
    const isValid = PROMPT_SORT_OPTIONS.some((o) => o.value === raw)
    return isValid ? (raw as PromptSortOption) : DEFAULT_PROMPT_SORT
  } catch {
    return DEFAULT_PROMPT_SORT
  }
}
