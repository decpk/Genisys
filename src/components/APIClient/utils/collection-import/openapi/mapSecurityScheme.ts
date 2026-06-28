import type { AuthType, AuthData } from '../../../APIClient.types'
import type { OpenApiSecurityScheme } from './openapi.types'

/**
 * Maps a single security scheme definition to a normalized auth result.
 *
 * - http bearer → 'bearer' (empty token).
 * - http basic → 'basic' (empty credentials).
 * - apiKey → 'api-key' (key = scheme.name or scheme name, addTo from `in`).
 * - anything else / missing → `null` (caller continues searching).
 */
export function mapSecurityScheme(
  schemeName: string,
  scheme: OpenApiSecurityScheme | undefined
): { authType: AuthType; authData: AuthData } | null {
  if (!scheme) return null

  const type = scheme.type
  const httpScheme = scheme.scheme?.toLowerCase()

  if (type === 'http' && httpScheme === 'bearer') {
    return { authType: 'bearer', authData: { token: '' } }
  }

  if (type === 'http' && httpScheme === 'basic') {
    return { authType: 'basic', authData: { username: '', password: '' } }
  }

  if (type === 'apiKey') {
    const addTo: 'header' | 'query' = scheme.in === 'query' ? 'query' : 'header'
    return {
      authType: 'api-key',
      authData: { key: scheme.name ?? schemeName, value: '', addTo },
    }
  }

  return null
}
