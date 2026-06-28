/**
 * Split items into incomplete / completed buckets.
 * Without a predicate, everything is treated as incomplete.
 */
export function partitionByCompletion<T>(
  items: T[],
  getIsCompleted?: (item: T) => boolean
): { incomplete: T[]; completed: T[] } {
  if (!getIsCompleted) {
    return { incomplete: [...items], completed: [] }
  }

  const incomplete: T[] = []
  const completed: T[] = []

  for (const item of items) {
    if (getIsCompleted(item)) {
      completed.push(item)
    } else {
      incomplete.push(item)
    }
  }

  return { incomplete, completed }
}
