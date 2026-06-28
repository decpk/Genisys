import type { NormalizedImportRequest } from '../../../utils/collection-import/collection-import.types'

/**
 * Counts distinct folder prefixes across a set of imported requests.
 * A request at path `['A', 'B']` contributes the prefixes `A` and `A/B`.
 */
export function countImportFolders(requests: NormalizedImportRequest[]): number {
  const prefixes = new Set<string>()

  for (const request of requests) {
    const segments = request.folderPath
    for (let depth = 1; depth <= segments.length; depth++) {
      prefixes.add(segments.slice(0, depth).join('/'))
    }
  }

  return prefixes.size
}
