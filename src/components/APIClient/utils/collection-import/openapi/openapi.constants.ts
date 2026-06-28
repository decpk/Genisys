import type { HttpMethod } from '../../../APIClient.types'

// Lowercase OpenAPI operation keys paired with their normalized HttpMethod.
// Order is the canonical display order for generated requests.
export const OPENAPI_HTTP_METHODS: ReadonlyArray<{
  key: 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options'
  method: HttpMethod
}> = [
  { key: 'get', method: 'GET' },
  { key: 'post', method: 'POST' },
  { key: 'put', method: 'PUT' },
  { key: 'patch', method: 'PATCH' },
  { key: 'delete', method: 'DELETE' },
  { key: 'head', method: 'HEAD' },
  { key: 'options', method: 'OPTIONS' },
]
