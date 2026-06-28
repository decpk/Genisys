import type { OpenApiDocument } from './openapi.types'

/**
 * Heuristic check that a parsed object looks like an OpenAPI / Swagger
 * document: it must declare a version (`openapi` or `swagger`) OR expose
 * a `paths` object we can iterate.
 */
export function isOpenApiDocument(value: unknown): value is OpenApiDocument {
  if (value === null || typeof value !== 'object') return false
  const doc = value as Record<string, unknown>
  const hasVersion =
    typeof doc.openapi === 'string' || typeof doc.swagger === 'string'
  const hasPaths = typeof doc.paths === 'object' && doc.paths !== null
  return hasVersion || hasPaths
}
