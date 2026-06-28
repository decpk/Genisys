import type { PromptComparator } from '../../PromptsAppSort.types'

/** Recently updated: descending by `updatedAt`. */
export const compareByUpdatedDesc: PromptComparator = (a, b) =>
  new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
