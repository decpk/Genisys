import type {
  PromptComparator,
  PromptSortOption,
} from '../PromptsAppSort.types'
import { compareByCreatedAsc } from './comparators/compareByCreatedAsc'
import { compareByCreatedDesc } from './comparators/compareByCreatedDesc'
import { compareByNameAsc } from './comparators/compareByNameAsc'
import { compareByNameDesc } from './comparators/compareByNameDesc'
import { compareBySortOrder } from './comparators/compareBySortOrder'
import { compareByUpdatedDesc } from './comparators/compareByUpdatedDesc'

/** Registry mapping each sort option to its pure comparator. */
export const PROMPT_SORT_COMPARATORS: Record<
  PromptSortOption,
  PromptComparator
> = {
  manual: compareBySortOrder,
  'name-asc': compareByNameAsc,
  'name-desc': compareByNameDesc,
  'created-desc': compareByCreatedDesc,
  'created-asc': compareByCreatedAsc,
  'updated-desc': compareByUpdatedDesc,
}
