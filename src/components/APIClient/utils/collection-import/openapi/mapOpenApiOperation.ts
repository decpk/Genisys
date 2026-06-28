import type { NormalizedImportRequest } from '../collection-import.types'
import type { MapOpenApiOperationArgs } from './openapi.types'
import { mapOpenApiParameters } from './mapOpenApiParameters'
import { mapOpenApiRequestBody } from './mapOpenApiRequestBody'
import { mapOpenApiSecurity } from './mapOpenApiSecurity'
import { resolveOperationName } from './resolveOperationName'
import { resolveFolderPath } from './resolveFolderPath'
import { buildContentTypeHeader } from './buildContentTypeHeader'

/**
 * Maps one path + operation into a NormalizedImportRequest.
 *
 * - `name` = summary || operationId || "<METHOD> <path>".
 * - `url` = `{{baseUrl}}` + path (path params like `{id}` stay inline).
 * - query/header params merge path-level + operation-level parameters.
 * - a JSON request body adds a `Content-Type: application/json` header.
 * - `folderPath` = `[firstTag]` when a tag exists, else `[]`.
 */
export function mapOpenApiOperation(args: MapOpenApiOperationArgs): NormalizedImportRequest {
  const { path, method, operation, pathLevelParams, doc } = args

  const allParameters = [...pathLevelParams, ...(operation.parameters ?? [])]
  const { params, headers } = mapOpenApiParameters(allParameters)
  const body = mapOpenApiRequestBody(operation.requestBody)

  if (body.bodyType === 'json') {
    headers.push(buildContentTypeHeader('application/json'))
  }

  const security = mapOpenApiSecurity(operation, doc)

  return {
    name: resolveOperationName(operation.summary, operation.operationId, method, path),
    method,
    url: `{{baseUrl}}${path}`,
    params,
    headers,
    bodyType: body.bodyType,
    bodyContent: body.bodyContent,
    authType: security.authType,
    authData: security.authData,
    folderPath: resolveFolderPath(operation.tags),
  }
}
