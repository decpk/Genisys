import type { ParsedRequest } from './curl-parser'
import type { ApiRequestItem } from '../APIClient.types'
import { isDefaultRequestName } from './isDefaultRequestName'

/**
 * Maps a `ParsedRequest` (from an imported cURL/fetch/etc. snippet) into a
 * partial update for an existing request. The request `name` is only
 * overwritten when the current name is still an auto-generated placeholder, so
 * a user-chosen name is preserved.
 */
export function buildRequestUpdatesFromParsed(
  parsed: ParsedRequest,
  currentName: string,
): Partial<ApiRequestItem> {
  const updates: Partial<ApiRequestItem> = {
    method: parsed.method,
    url: parsed.url,
    params: parsed.params,
    headers: parsed.headers,
    bodyType: parsed.bodyType,
    bodyContent: parsed.bodyContent,
    authType: parsed.authType,
    authData: parsed.authData,
  }
  if (isDefaultRequestName(currentName)) {
    updates.name = parsed.name
  }
  return updates
}
