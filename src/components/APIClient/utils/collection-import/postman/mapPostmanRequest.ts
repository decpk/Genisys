import type { NormalizedImportRequest } from '@/components/APIClient/utils/collection-import/collection-import.types'
import type { PostmanItem } from './postman.types'
import { normalizePostmanMethod } from './normalizePostmanMethod'
import { normalizePostmanRequestShape } from './normalizePostmanRequestShape'
import { mapPostmanUrl } from './mapPostmanUrl'
import { mapPostmanHeaders } from './mapPostmanHeaders'
import { mapPostmanBody } from './mapPostmanBody'
import { mapPostmanAuth } from './mapPostmanAuth'

/**
 * Convert a single leaf Postman item (one carrying a `request`) into a
 * normalized import request. `request` may be a bare url string or an object.
 */
export function mapPostmanRequest(
  item: PostmanItem,
  folderPath: string[],
): NormalizedImportRequest {
  const name = item?.name ?? 'Imported Request'
  const request = normalizePostmanRequestShape(item?.request)

  const { url, params } = mapPostmanUrl(request.url)
  const { bodyType, bodyContent } = mapPostmanBody(request.body)
  const { authType, authData } = mapPostmanAuth(request.auth)

  return {
    name,
    method: normalizePostmanMethod(request.method),
    url,
    params,
    headers: mapPostmanHeaders(request.header),
    bodyType,
    bodyContent,
    authType,
    authData,
    folderPath,
  }
}
