import type { OpenApiParameter } from './openapi.types'
import { stringifyExampleValue } from './stringifyExampleValue'

/**
 * Picks the best available value for a parameter, in priority order:
 * parameter.example → schema.example → schema.default → Swagger 2.0
 * `default`. Returns '' when nothing is provided.
 */
export function resolveParameterValue(parameter: OpenApiParameter): string {
  const candidates: unknown[] = [
    parameter.example,
    parameter.schema?.example,
    parameter.schema?.default,
    parameter.default,
  ]

  for (const candidate of candidates) {
    if (candidate !== undefined && candidate !== null) {
      return stringifyExampleValue(candidate)
    }
  }

  return ''
}
