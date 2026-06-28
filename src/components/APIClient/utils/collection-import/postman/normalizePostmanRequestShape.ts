import type { PostmanRequest } from './postman.types'

/**
 * Coerce a Postman item `request` (which may be a bare url string, an object,
 * or missing) into a consistent `PostmanRequest` object.
 */
export function normalizePostmanRequestShape(
  request: string | PostmanRequest | undefined,
): PostmanRequest {
  if (!request) return { method: 'GET' }
  if (typeof request === 'string') return { method: 'GET', url: request }
  return request
}
