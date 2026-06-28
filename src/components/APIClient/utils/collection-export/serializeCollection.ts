import type {
  ApiCollection,
  ApiFolder,
  ApiRequestItem,
} from '@/components/APIClient/APIClient.types'
import type {
  NormalizedImportCollection,
  NormalizedImportVariable,
} from '@/components/APIClient/utils/collection-import/collection-import.types'
import { buildFolderPathMap } from './buildFolderPathMap'
import { serializeRequest } from './serializeRequest'

/**
 * Serializes a stored collection (with its folders, requests and mapped
 * variables) into the normalized export collection shape.
 */
export function serializeCollection(
  collection: ApiCollection,
  folders: ApiFolder[],
  requests: ApiRequestItem[],
  variables: NormalizedImportVariable[],
): NormalizedImportCollection {
  const folderPathMap = buildFolderPathMap(folders)
  const serializedRequests = requests.map((request) =>
    serializeRequest(request, folderPathMap),
  )

  return {
    name: collection.name,
    description: collection.description ?? '',
    requests: serializedRequests,
    variables,
  }
}
