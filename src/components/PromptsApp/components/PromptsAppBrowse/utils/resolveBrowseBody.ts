import type { PromptsAppData } from '../../../PromptsApp.types'

export type PromptsAppBrowseBodyKind =
  | 'grid'
  | 'no-data'
  | 'no-search-results'
  | 'empty-folder'

/**
 * Pure decision function — given a scoped data view (already narrowed
 * by section), returns which body variant the Browse view should
 * render. Mirrors the original `PromptsAppContent` if/else chain.
 */
export function resolveBrowseBody(data: PromptsAppData): PromptsAppBrowseBodyKind {
  const isSearching = !!data.searchQuery.trim()
  const hasResults = data.filteredPrompts.length > 0

  if (hasResults) return 'grid'
  if (data.totalPromptCount === 0) return 'no-data'
  if (isSearching) return 'no-search-results'
  return 'empty-folder'
}
