import type { PromptComparator } from '../../PromptsAppSort.types'

/** Title A→Z, case-insensitive. */
export const compareByNameAsc: PromptComparator = (a, b) =>
  a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })
