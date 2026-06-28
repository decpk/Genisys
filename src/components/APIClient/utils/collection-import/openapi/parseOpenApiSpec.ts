import type {
  NormalizedImportCollection,
  NormalizedImportVariable,
} from '../collection-import.types'
import type { OpenApiDocument } from './openapi.types'
import { parseSpecDocument } from './parseSpecDocument'
import { isOpenApiDocument } from './isOpenApiDocument'
import { buildOpenApiBaseUrl } from './buildOpenApiBaseUrl'
import { buildOpenApiRequests } from './buildOpenApiRequests'

/**
 * Parses a raw OpenAPI 3.x / Swagger 2.0 spec (JSON or YAML text) into a
 * NormalizedImportCollection — one request per path + operation.
 *
 * This is the only function in the module allowed to throw; it does so
 * when the input is neither valid JSON nor valid YAML, or when the parsed
 * object does not look like an OpenAPI/Swagger document.
 *
 * Assumptions (v1): `$ref` schemas resolve to an empty `{}` example
 * (not dereferenced); example generation is shallow; the first applicable
 * security scheme wins.
 */
export function parseOpenApiSpec(raw: string): NormalizedImportCollection {
  const parsed = parseSpecDocument(raw)
  if (parsed === null) {
    throw new Error('Failed to parse spec: input is not valid JSON or YAML.')
  }

  if (!isOpenApiDocument(parsed)) {
    throw new Error(
      'Failed to parse spec: missing "openapi"/"swagger" version and "paths".'
    )
  }

  const doc: OpenApiDocument = parsed
  const baseUrl = buildOpenApiBaseUrl(doc)
  const variables: NormalizedImportVariable[] = [{ key: 'baseUrl', value: baseUrl }]

  return {
    name: doc.info?.title ?? 'Imported API',
    description: doc.info?.description ?? '',
    requests: buildOpenApiRequests(doc),
    variables,
  }
}
