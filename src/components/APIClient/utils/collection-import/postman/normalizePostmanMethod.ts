import type { HttpMethod } from '@/components/APIClient/APIClient.types'

const SUPPORTED_METHODS: HttpMethod[] = [
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'HEAD',
  'OPTIONS',
]

/**
 * Normalize a Postman request method to a supported `HttpMethod`,
 * defaulting to `GET` for missing/unknown values.
 */
export function normalizePostmanMethod(method: string | undefined): HttpMethod {
  if (!method) return 'GET'

  const upper = method.toUpperCase() as HttpMethod
  if (SUPPORTED_METHODS.includes(upper)) return upper

  return 'GET'
}
