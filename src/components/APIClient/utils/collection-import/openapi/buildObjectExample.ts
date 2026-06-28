import type { OpenApiSchema } from './openapi.types'
import { buildPropertyExample } from './buildPropertyExample'

/**
 * Builds a flat `{ property: placeholder }` example map for an object
 * schema. Each property value is resolved via `buildPropertyExample`,
 * which recurses at most one nested level.
 */
export function buildObjectExample(schema: OpenApiSchema): Record<string, unknown> {
  const properties = schema.properties ?? {}
  const example: Record<string, unknown> = {}

  for (const [key, propSchema] of Object.entries(properties)) {
    example[key] = buildPropertyExample(propSchema)
  }

  return example
}
