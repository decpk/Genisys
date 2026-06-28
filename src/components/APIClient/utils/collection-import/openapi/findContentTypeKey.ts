import type { OpenApiMediaType } from './openapi.types'

/**
 * Finds the first content-type key whose name contains the given suffix
 * (e.g. 'json' matches `application/json` and `application/vnd.api+json`).
 */
export function findContentTypeKey(
  content: Record<string, OpenApiMediaType>,
  suffix: 'json' | 'xml'
): string | undefined {
  return Object.keys(content).find((type) => type.toLowerCase().includes(suffix))
}
