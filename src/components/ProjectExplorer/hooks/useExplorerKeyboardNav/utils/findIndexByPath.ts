import type { RepoItem } from '../../../ProjectExplorer.types'

/**
 * Find the index of an item by path in the sorted/displayed items array.
 * Returns -1 if path is null or no match is found.
 */
export function findIndexByPath(items: RepoItem[], path: string | null): number {
  if (path === null) return -1
  for (let i = 0; i < items.length; i++) {
    if (items[i].path === path) return i
  }
  return -1
}
