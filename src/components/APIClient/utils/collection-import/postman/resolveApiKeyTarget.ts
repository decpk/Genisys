/**
 * Resolve where a Postman API-key auth value is applied — `header` (default)
 * or `query`.
 */
export function resolveApiKeyTarget(location: string): 'header' | 'query' {
  if (location === 'query') return 'query'
  return 'header'
}
