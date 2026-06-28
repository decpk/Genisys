import type { OpenApiDocument, OpenApiSecurityScheme } from './openapi.types'

/**
 * Merges security scheme definitions from both OpenAPI 3
 * (`components.securitySchemes`) and Swagger 2.0 (`securityDefinitions`).
 * OpenAPI 3 definitions take precedence on name collisions.
 */
export function collectSecuritySchemes(
  doc: OpenApiDocument
): Record<string, OpenApiSecurityScheme> {
  return {
    ...(doc.securityDefinitions ?? {}),
    ...(doc.components?.securitySchemes ?? {}),
  }
}
