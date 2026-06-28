import type { OpenApiMediaType } from './openapi.types'
import { buildSchemaExample } from './buildSchemaExample'
import { stringifyJsonBody } from './stringifyJsonBody'

/**
 * Produces JSON body content for a media type. Prefers an explicit
 * `example`; otherwise generates a shallow example from the schema.
 */
export function buildJsonBodyContent(mediaType: OpenApiMediaType | undefined): string {
  if (!mediaType) return '{}'

  if (mediaType.example !== undefined) {
    return stringifyJsonBody(mediaType.example)
  }

  const example = buildSchemaExample(mediaType.schema)
  return stringifyJsonBody(example)
}
