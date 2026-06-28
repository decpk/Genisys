import type { ApiFolder } from '@/components/APIClient/APIClient.types'

/**
 * Builds a map from folder id to its root→leaf path of folder names.
 * Inverse of the import-side folder builder. Cycle-safe: a repeated or
 * missing parent id stops the walk for that folder.
 */
export function buildFolderPathMap(folders: ApiFolder[]): Map<string, string[]> {
  const byId = new Map<string, ApiFolder>()
  for (const folder of folders) {
    byId.set(folder.id, folder)
  }

  const pathMap = new Map<string, string[]>()
  for (const folder of folders) {
    const names: string[] = []
    const visited = new Set<string>()
    let current: ApiFolder | undefined = folder

    while (current) {
      if (visited.has(current.id)) {
        break
      }
      visited.add(current.id)
      names.push(current.name)

      const parentId = current.parentFolderId
      if (parentId === null || parentId === undefined) {
        break
      }
      if (visited.has(parentId)) {
        break
      }
      current = byId.get(parentId)
    }

    names.reverse()
    pathMap.set(folder.id, names)
  }

  return pathMap
}
