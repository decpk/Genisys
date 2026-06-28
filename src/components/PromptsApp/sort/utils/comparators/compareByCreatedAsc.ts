import type { PromptComparator } from '../../PromptsAppSort.types'

/** Oldest first: ascending by `createdAt`. */
export const compareByCreatedAsc: PromptComparator = (a, b) =>
  new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
