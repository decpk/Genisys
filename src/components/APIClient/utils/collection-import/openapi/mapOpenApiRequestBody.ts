import type { BodyType } from '../../../APIClient.types'
import type { OpenApiRequestBody } from './openapi.types'
import { findContentTypeKey } from './findContentTypeKey'
import { findFormContentTypeKey } from './findFormContentTypeKey'
import { buildJsonBodyContent } from './buildJsonBodyContent'

/**
 * Maps an OpenAPI `requestBody` to a normalized body type + content.
 *
 * Content-type preference:
 * - `application/json` (or any `+json`) → 'json' with a shallow example
 *   JSON string generated from the schema.
 * - `application/xml` (or any `+xml`) → 'xml' (empty content).
 * - `multipart/form-data` / `application/x-www-form-urlencoded` →
 *   'form-data' (empty content).
 * - nothing recognizable / no body → 'none'.
 */
export function mapOpenApiRequestBody(
  requestBody: OpenApiRequestBody | undefined
): { bodyType: BodyType; bodyContent: string } {
  const content = requestBody?.content
  if (!content || typeof content !== 'object') {
    return { bodyType: 'none', bodyContent: '' }
  }

  const jsonKey = findContentTypeKey(content, 'json')
  if (jsonKey) {
    return { bodyType: 'json', bodyContent: buildJsonBodyContent(content[jsonKey]) }
  }

  if (findContentTypeKey(content, 'xml')) {
    return { bodyType: 'xml', bodyContent: '' }
  }

  if (findFormContentTypeKey(content)) {
    return { bodyType: 'form-data', bodyContent: '' }
  }

  return { bodyType: 'none', bodyContent: '' }
}
