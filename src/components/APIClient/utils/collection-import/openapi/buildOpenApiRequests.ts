import type { NormalizedImportRequest } from '../collection-import.types'
import type { OpenApiDocument } from './openapi.types'
import { OPENAPI_HTTP_METHODS } from './openapi.constants'
import { mapOpenApiOperation } from './mapOpenApiOperation'

/**
 * Iterates every path + supported HTTP method on the document and maps
 * each present operation into a NormalizedImportRequest. Path-level
 * parameters are merged into each operation by the operation mapper.
 */
export function buildOpenApiRequests(doc: OpenApiDocument): NormalizedImportRequest[] {
  const requests: NormalizedImportRequest[] = []
  const paths = doc.paths ?? {}

  for (const path of Object.keys(paths)) {
    const pathItem = paths[path]
    if (!pathItem || typeof pathItem !== 'object') continue

    const pathLevelParams = pathItem.parameters ?? []

    for (const { key, method } of OPENAPI_HTTP_METHODS) {
      const operation = pathItem[key]
      if (!operation || typeof operation !== 'object') continue

      requests.push(
        mapOpenApiOperation({ path, method, operation, pathLevelParams, doc })
      )
    }
  }

  return requests
}
