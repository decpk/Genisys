import type { AuthType, AuthData } from '../../../APIClient.types'
import type { OpenApiDocument } from './openapi.types'
import { collectSecuritySchemes } from './collectSecuritySchemes'
import { mapSecurityScheme } from './mapSecurityScheme'

const NONE_RESULT: { authType: AuthType; authData: AuthData } = {
  authType: 'none',
  authData: {},
}

/**
 * Best-effort auth resolution from `security` + security scheme defs.
 *
 * - Uses the operation's `security`, falling back to document-level
 *   `security`.
 * - The first applicable scheme wins.
 * - http bearer → 'bearer'; http basic → 'basic'; apiKey → 'api-key'.
 * - Anything else / nothing → 'none'.
 */
export function mapOpenApiSecurity(
  operation: { security?: Array<Record<string, string[]>> } | undefined,
  doc: OpenApiDocument
): { authType: AuthType; authData: AuthData } {
  const requirements = operation?.security ?? doc.security
  if (!Array.isArray(requirements) || requirements.length === 0) {
    return NONE_RESULT
  }

  const schemes = collectSecuritySchemes(doc)

  for (const requirement of requirements) {
    const schemeNames = Object.keys(requirement ?? {})
    for (const schemeName of schemeNames) {
      const mapped = mapSecurityScheme(schemeName, schemes[schemeName])
      if (mapped) return mapped
    }
  }

  return NONE_RESULT
}
