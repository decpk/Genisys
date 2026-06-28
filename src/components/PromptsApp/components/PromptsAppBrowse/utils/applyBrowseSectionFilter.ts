import type { PmPrompt } from '@/store/prompt-manager-store'

import type { PromptsAppBrowseSection } from '../PromptsAppBrowse.types'
import { filterByBuiltIn } from './filterByBuiltIn'
import { filterByFavorites } from './filterByFavorites'
import { filterByRecents } from './filterByRecents'

/**
 * Applies one of the Browse-section filters on top of the already
 * folder/category/search-scoped `prompts`. `all` is the identity
 * filter — callers may use the result directly without checking for
 * referential equality.
 */
export function applyBrowseSectionFilter(
  prompts: PmPrompt[],
  section: PromptsAppBrowseSection,
): PmPrompt[] {
  if (section === 'recents') return filterByRecents(prompts)
  if (section === 'favorites') return filterByFavorites(prompts)
  if (section === 'builtin') return filterByBuiltIn(prompts)
  return prompts
}
