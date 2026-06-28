import type {
  DPPriority,
  DPSortDirection,
  DPTaskSortBy,
  DPTaskStatus,
} from '../DailyPlan.types'

/**
 * Minimal shape shared by `DPTask` and `DPReview` that the sort comparators rely on.
 * Both types expose these fields, so a single generic sort works for either list.
 */
export interface DPSortableItem {
  title: string
  status: DPTaskStatus
  priority: DPPriority
  scheduledTime: string | null
  sortOrder: number
  createdAt: string
}

const PRIORITY_RANK: Record<DPPriority, number> = {
  low: 0,
  medium: 1,
  high: 2,
  urgent: 3,
}

const STATUS_RANK: Record<DPTaskStatus, number> = {
  todo: 0,
  in_progress: 1,
  completed: 2,
}

/** Comparators return ascending order; direction is applied afterwards. */
function compareBy(sortBy: DPTaskSortBy, a: DPSortableItem, b: DPSortableItem): number {
  switch (sortBy) {
    case 'priority':
      return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
    case 'time': {
      // Null scheduled times always sink to the end regardless of direction.
      if (a.scheduledTime === b.scheduledTime) return 0
      if (a.scheduledTime === null) return 1
      if (b.scheduledTime === null) return -1
      return a.scheduledTime.localeCompare(b.scheduledTime)
    }
    case 'created':
      return a.createdAt.localeCompare(b.createdAt)
    case 'title':
      return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })
    case 'status':
      return STATUS_RANK[a.status] - STATUS_RANK[b.status]
    case 'manual':
    default:
      return a.sortOrder - b.sortOrder
  }
}

/**
 * Returns a new, sorted array. The input array is not mutated.
 *
 * - `manual` preserves the user-defined `sortOrder` (current/default behavior).
 * - Every comparator falls back to `sortOrder` to keep ordering stable on ties.
 * - For the `time` sort, items without a scheduled time always sort last.
 */
export function sortDPItems<T extends DPSortableItem>(
  items: T[],
  sortBy: DPTaskSortBy,
  direction: DPSortDirection,
): T[] {
  if (sortBy === 'manual') {
    const sorted = [...items].sort((a, b) => a.sortOrder - b.sortOrder)
    return direction === 'desc' ? sorted.reverse() : sorted
  }

  const dir = direction === 'desc' ? -1 : 1
  return [...items].sort((a, b) => {
    // Keep null scheduled times pinned to the end in both directions.
    if (sortBy === 'time') {
      if (a.scheduledTime === null && b.scheduledTime === null) {
        return a.sortOrder - b.sortOrder
      }
      if (a.scheduledTime === null) return 1
      if (b.scheduledTime === null) return -1
    }

    const primary = compareBy(sortBy, a, b)
    if (primary !== 0) return primary * dir
    return a.sortOrder - b.sortOrder
  })
}
