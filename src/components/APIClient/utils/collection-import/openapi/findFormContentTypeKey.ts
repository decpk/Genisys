import type { OpenApiMediaType } from './openapi.types'

/**
 * Finds the first form content-type key — either `multipart/form-data`
 * or `application/x-www-form-urlencoded`.
 */
export function findFormContentTypeKey(
  content: Record<string, OpenApiMediaType>
): string | undefined {
  return Object.keys(content).find((type) => {
    const lower = type.toLowerCase()
    return lower.includes('form-data') || lower.includes('x-www-form-urlencoded')
  })
}
