import type { PmPrompt } from '@/store/prompt-manager-store'

import type { PromptSortOption } from '../PromptsAppSort.types'
import { PROMPT_SORT_COMPARATORS } from './promptSortComparators'

/**
 * Return a new array of prompts sorted by the given option. Pure and
 * non-mutating — never reorders the input array in place.
 */
export function sortPrompts(
  prompts: PmPrompt[],
  option: PromptSortOption,
): PmPrompt[] {
  const comparator = PROMPT_SORT_COMPARATORS[option]
  if (!comparator) return prompts
  return [...prompts].sort(comparator)
}
