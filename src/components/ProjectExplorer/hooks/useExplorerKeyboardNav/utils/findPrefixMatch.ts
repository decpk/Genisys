import type { RepoItem } from '../../../ProjectExplorer.types'

/**
 * Find the first item whose basename starts with the given prefix (case-insensitive).
 *
 * The search starts from `startIndex + 1` and wraps around once to allow cycling
 * through multiple matches (e.g. pressing "a" repeatedly cycles through files
 * starting with "a"). If `startIndex === -1`, the search begins at 0.
 *
 * Returns -1 if no match is found.
 */
export function findPrefixMatch(
  items: RepoItem[],
  prefix: string,
  startIndex: number
): number {
  if (items.length === 0 || prefix.length === 0) return -1

  const lowerPrefix = prefix.toLowerCase()
  const count = items.length
  const begin = startIndex < 0 ? 0 : (startIndex + 1) % count

  for (let step = 0; step < count; step++) {
    const idx = (begin + step) % count
    const item = items[idx]
    const name = item.path.split('/').pop() ?? item.path
    if (name.toLowerCase().startsWith(lowerPrefix)) return idx
  }

  return -1
}
