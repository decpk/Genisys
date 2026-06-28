/**
 * Returns a tuple of new (non-duplicate) paths and the number of duplicates skipped,
 * given the existing list and an incoming list of candidate paths.
 */
export function dedupeFilePaths(
  existing: string[],
  incoming: string[],
): { unique: string[]; duplicateCount: number } {
  const existingSet = new Set(existing)
  const unique: string[] = []
  let duplicateCount = 0

  for (const path of incoming) {
    if (existingSet.has(path)) {
      duplicateCount += 1
      continue
    }
    existingSet.add(path)
    unique.push(path)
  }

  return { unique, duplicateCount }
}
