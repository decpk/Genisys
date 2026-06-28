/**
 * Stringifies an example/default value for use in a KeyValuePair or
 * query/header field. Strings pass through; numbers/booleans are
 * coerced; objects are JSON-serialized (best-effort).
 */
export function stringifyExampleValue(value: unknown): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  try {
    return JSON.stringify(value)
  } catch {
    return ''
  }
}
