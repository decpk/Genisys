import type { HttpMethod } from '../../../APIClient.types'
import type { NormalizedImportRequest } from '../collection-import.types'
import type { InsomniaRequest } from './insomnia.types'
import { mapInsomniaUrl } from './mapInsomniaUrl'
import { mapInsomniaHeaders } from './mapInsomniaHeaders'
import { mapInsomniaBody } from './mapInsomniaBody'
import { mapInsomniaAuth } from './mapInsomniaAuth'

const HTTP_METHODS: HttpMethod[] = [
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'HEAD',
  'OPTIONS',
]

/**
 * Convert a single Insomnia request resource into a normalized import
 * request, attaching the precomputed folder path.
 */
export function mapInsomniaRequest(
  resource: InsomniaRequest,
  folderPath: string[]
): NormalizedImportRequest {
  const { url, params } = mapInsomniaUrl(resource.url, resource.parameters)
  const { bodyType, bodyContent } = mapInsomniaBody(resource.body)
  const { authType, authData } = mapInsomniaAuth(resource.authentication)

  return {
    name: resource.name ?? 'Imported Request',
    method: normalizeMethod(resource.method),
    url,
    params,
    headers: mapInsomniaHeaders(resource.headers),
    bodyType,
    bodyContent,
    authType,
    authData,
    folderPath,
  }
}

function normalizeMethod(method: string | undefined): HttpMethod {
  const upper = (method ?? 'GET').toUpperCase()
  if (HTTP_METHODS.includes(upper as HttpMethod)) return upper as HttpMethod
  return 'GET'
}
