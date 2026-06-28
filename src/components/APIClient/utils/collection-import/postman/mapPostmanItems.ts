import type { NormalizedImportRequest } from '@/components/APIClient/utils/collection-import/collection-import.types'
import type { PostmanItem } from './postman.types'
import { mapPostmanRequest } from './mapPostmanRequest'

/**
 * Recursively flatten a Postman item tree into normalized requests.
 * An item WITH an `item[]` array is a folder (its name extends the path for
 * children); an item WITH a `request` is a leaf and becomes one request.
 */
export function mapPostmanItems(
  items: PostmanItem[] | undefined,
  parentPath: string[],
): NormalizedImportRequest[] {
  if (!Array.isArray(items)) return []

  const result: NormalizedImportRequest[] = []

  for (const item of items) {
    if (!item) continue

    if (Array.isArray(item.item)) {
      const folderName = item.name ?? 'Folder'
      const childPath = [...parentPath, folderName]
      result.push(...mapPostmanItems(item.item, childPath))
      continue
    }

    if (item.request !== undefined) {
      result.push(mapPostmanRequest(item, parentPath))
    }
  }

  return result
}
