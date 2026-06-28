import type { PromptComparator } from '../../PromptsAppSort.types'

/** Title Z→A, case-insensitive. */
export const compareByNameDesc: PromptComparator = (a, b) =>
  b.title.localeCompare(a.title, undefined, { sensitivity: 'base' })
