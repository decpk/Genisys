import type { ApiClientStore } from '../../api-client-store'
import type { NormalizedImportRequest } from '@/components/APIClient/utils/collection-import/collection-import.types'

/**
 * Creates each imported request inside the target collection/folder and
 * populates its full payload (url, params, headers, body, auth).
 * Returns the number of requests created.
 */
export async function applyImportedRequests(
  get: () => ApiClientStore,
  collectionId: string,
  requests: NormalizedImportRequest[],
  folderIdByPath: Map<string, string>
): Promise<number> {
  let created = 0

  for (const request of requests) {
    const folderKey = request.folderPath.join('\u0000')
    const folderId = folderKey === '' ? undefined : folderIdByPath.get(folderKey)

    const item = await get().addRequest(collectionId, request.name, request.method, folderId)
    await get().updateRequest(item.id, {
      url: request.url,
      params: request.params,
      headers: request.headers,
      bodyType: request.bodyType,
      bodyContent: request.bodyContent,
      authType: request.authType,
      authData: request.authData,
    })
    created++
  }

  return created
}
