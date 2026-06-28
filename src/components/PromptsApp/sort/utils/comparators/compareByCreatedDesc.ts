import type { PromptComparator } from '../../PromptsAppSort.types'

/** Newest first: descending by `createdAt`. */
export const compareByCreatedDesc: PromptComparator = (a, b) =>
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
