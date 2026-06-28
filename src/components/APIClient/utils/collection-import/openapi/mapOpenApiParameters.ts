import type { KeyValuePair } from '../../../APIClient.types'
import type { OpenApiParameter } from './openapi.types'
import { resolveParameterValue } from './resolveParameterValue'

/**
 * Splits OpenAPI parameters into query params and header params.
 *
 * - Only `in: 'query'` and `in: 'header'` are mapped; path/cookie params
 *   are ignored (path params stay inline in the URL).
 * - `$ref` parameters are skipped (refs are not resolved in v1).
 * - Value comes from `resolveParameterValue`, else ''.
 * - All produced pairs are `enabled: true`.
 */
export function mapOpenApiParameters(
  parameters: OpenApiParameter[] | undefined
): { params: KeyValuePair[]; headers: KeyValuePair[] } {
  const params: KeyValuePair[] = []
  const headers: KeyValuePair[] = []

  if (!Array.isArray(parameters)) {
    return { params, headers }
  }

  for (const parameter of parameters) {
    if (!parameter || parameter.$ref) continue
    const name = parameter.name
    if (typeof name !== 'string' || name.length === 0) continue

    const pair: KeyValuePair = {
      id: crypto.randomUUID(),
      key: name,
      value: resolveParameterValue(parameter),
      enabled: true,
    }

    if (parameter.in === 'query') params.push(pair)
    else if (parameter.in === 'header') headers.push(pair)
  }

  return { params, headers }
}
