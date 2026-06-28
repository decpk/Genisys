import type { ApiClientStore } from '../../api-client-store'
import type { NormalizedImportRequest } from '@/components/APIClient/utils/collection-import/collection-import.types'

/** Joins a folder path into a stable map key (null byte can't appear in names). */
function pathKey(path: string[]): string {
  return path.join('\u0000')
}

/**
 * Creates every folder (and nested parent) referenced by the imported requests,
 * returning a map of folder-path-key → folderId. Parents are always created
 * before their children so `parentFolderId` can be resolved.
 */
export async function buildImportFolders(
  get: () => ApiClientStore,
  collectionId: string,
  requests: NormalizedImportRequest[]
): Promise<Map<string, string>> {
  const folderIdByPath = new Map<string, string>()

  // Collect every distinct folder path prefix across all requests.
  const prefixes = new Set<string>()
  for (const request of requests) {
    const path = request.folderPath
    for (let depth = 1; depth <= path.length; depth++) {
      prefixes.add(pathKey(path.slice(0, depth)))
    }
  }

  // Sort by depth so parents are created before children.
  const orderedKeys = Array.from(prefixes).sort((a, b) => {
    const da = a === '' ? 0 : a.split('\u0000').length
    const db = b === '' ? 0 : b.split('\u0000').length
    return da - db
  })

  for (const key of orderedKeys) {
    if (key === '') continue
    const segments = key.split('\u0000')
    const name = segments[segments.length - 1]
    const parentKey = pathKey(segments.slice(0, -1))
    const parentFolderId = parentKey === '' ? undefined : folderIdByPath.get(parentKey)
    const folder = await get().addFolder(collectionId, name, parentFolderId)
    folderIdByPath.set(key, folder.id)
  }

  return folderIdByPath
}
