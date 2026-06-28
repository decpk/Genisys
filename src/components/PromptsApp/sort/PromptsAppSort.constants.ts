import type {
  PromptSortDescriptor,
  PromptSortOption,
} from './PromptsAppSort.types'

/** Default sort = manual (preserves the existing `sortOrder` behavior). */
export const DEFAULT_PROMPT_SORT: PromptSortOption = 'manual'

/** localStorage key for the persisted Prompts-library sort choice. */
export const PROMPT_SORT_STORAGE_KEY = 'genisys.promptsApp.sortOption'

/**
 * Single source of truth for the sort options offered in the Prompts
 * library. Module-level constant so React refs stay stable across renders.
 */
export const PROMPT_SORT_OPTIONS: ReadonlyArray<PromptSortDescriptor> = [
  { value: 'manual', label: 'Manual order' },
  { value: 'name-asc', label: 'Name (A–Z)' },
  { value: 'name-desc', label: 'Name (Z–A)' },
  { value: 'created-desc', label: 'Newest first' },
  { value: 'created-asc', label: 'Oldest first' },
  { value: 'updated-desc', label: 'Recently updated' },
]
