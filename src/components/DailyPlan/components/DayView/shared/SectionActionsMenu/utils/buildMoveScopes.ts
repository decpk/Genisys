import type { MoveScopeDescriptor } from '../SectionActionsMenu.types'
import { partitionByCompletion } from './partitionByCompletion'

/**
 * Build the adaptive list of move scopes for a section.
 * - Always includes `{ key: 'all', label: 'Move all', items }`.
 * - Adds `incomplete` and `completed` scopes only when a completion predicate is
 *   provided AND both buckets are non-empty.
 */
export function buildMoveScopes<T>(args: {
  items: T[]
  getIsCompleted?: (item: T) => boolean
}): MoveScopeDescriptor<T>[] {
  const { items, getIsCompleted } = args

  const scopes: MoveScopeDescriptor<T>[] = [{ key: 'all', label: 'Move all', items }]

  if (!getIsCompleted) {
    return scopes
  }

  const { incomplete, completed } = partitionByCompletion(items, getIsCompleted)

  if (incomplete.length > 0 && completed.length > 0) {
    scopes.push({ key: 'incomplete', label: 'Move incomplete', items: incomplete })
    scopes.push({ key: 'completed', label: 'Move completed', items: completed })
  }

  return scopes
}
