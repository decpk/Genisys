import type { OpenApiDocument } from './openapi.types'

/**
 * Resolves the request base URL for an imported spec.
 *
 * - OpenAPI 3: first `servers[].url`.
 * - Swagger 2.0: `schemes[0]://host + basePath`.
 *
 * Returns '' when no base URL can be derived.
 */
export function buildOpenApiBaseUrl(doc: OpenApiDocument): string {
  const serverUrl = doc.servers?.[0]?.url
  if (typeof serverUrl === 'string' && serverUrl.length > 0) {
    return serverUrl
  }

  const host = doc.host
  if (typeof host === 'string' && host.length > 0) {
    const scheme = doc.schemes?.[0] ?? 'https'
    const basePath = doc.basePath ?? ''
    return `${scheme}://${host}${basePath}`
  }

  return ''
}
