import type { PromptComparator } from '../../PromptsAppSort.types'

/** Manual order: ascending by the user-defined `sortOrder`. */
export const compareBySortOrder: PromptComparator = (a, b) =>
  a.sortOrder - b.sortOrder
