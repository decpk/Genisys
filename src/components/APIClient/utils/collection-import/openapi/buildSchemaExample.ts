import type { OpenApiSchema } from './openapi.types'
import { SCHEMA_TYPE_PLACEHOLDERS } from './schemaExample.constants'
import { buildObjectExample } from './buildObjectExample'

/**
 * Builds a SHALLOW example value from an OpenAPI schema.
 *
 * Rules:
 * - `example` / `default` are used verbatim when present.
 * - `$ref` schemas resolve to `{}` (refs are NOT dereferenced in v1).
 * - arrays → `[]`.
 * - objects → one-level map of property → placeholder (nested objects
 *   recurse a single level via `buildObjectExample`).
 * - primitives → a type-based placeholder.
 */
export function buildSchemaExample(schema: OpenApiSchema | undefined): unknown {
  if (!schema) return {}

  if (schema.example !== undefined) return schema.example
  if (schema.default !== undefined) return schema.default
  if (schema.$ref) return {}

  if (Array.isArray(schema.enum) && schema.enum.length > 0) {
    return schema.enum[0]
  }

  if (schema.type === 'array') return []

  if (schema.type === 'object' || schema.properties) {
    return buildObjectExample(schema)
  }

  const placeholder = SCHEMA_TYPE_PLACEHOLDERS[schema.type ?? '']
  if (placeholder !== undefined) return placeholder

  return null
}
