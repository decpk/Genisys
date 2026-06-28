import type { ApiRequestItem } from '@/components/APIClient/APIClient.types'
import type { NormalizedImportRequest } from '@/components/APIClient/utils/collection-import/collection-import.types'

/**
 * Serializes a stored API request into the normalized export shape,
 * resolving its folder path from the supplied folder-path map.
 */
export function serializeRequest(
  request: ApiRequestItem,
  folderPathMap: Map<string, string[]>,
): NormalizedImportRequest {
  let folderPath: string[] = []
  if (request.folderId !== null && request.folderId !== undefined) {
    folderPath = folderPathMap.get(request.folderId) ?? []
  }

  return {
    name: request.name,
    method: request.method,
    url: request.url,
    params: request.params,
    headers: request.headers,
    bodyType: request.bodyType,
    bodyContent: request.bodyContent,
    authType: request.authType,
    authData: request.authData,
    folderPath,
  }
}
