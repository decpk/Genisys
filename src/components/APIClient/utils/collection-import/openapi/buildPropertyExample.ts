import type { OpenApiSchema } from './openapi.types'
import { SCHEMA_TYPE_PLACEHOLDERS } from './schemaExample.constants'
import { buildObjectExample } from './buildObjectExample'

/**
 * Resolves a single property's shallow example value.
 *
 * `$ref` properties produce `{}` (refs are not dereferenced in v1).
 * Nested objects recurse exactly one level via `buildObjectExample`.
 */
export function buildPropertyExample(propSchema: OpenApiSchema): unknown {
  if (propSchema.example !== undefined) return propSchema.example
  if (propSchema.default !== undefined) return propSchema.default
  if (propSchema.$ref) return {}

  if (Array.isArray(propSchema.enum) && propSchema.enum.length > 0) {
    return propSchema.enum[0]
  }

  if (propSchema.type === 'array') return []

  if (propSchema.type === 'object' || propSchema.properties) {
    return buildObjectExample(propSchema)
  }

  const placeholder = SCHEMA_TYPE_PLACEHOLDERS[propSchema.type ?? '']
  if (placeholder !== undefined) return placeholder

  return null
}
