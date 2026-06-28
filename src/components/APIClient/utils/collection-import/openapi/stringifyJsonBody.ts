/**
 * JSON-stringifies a value with 2-space indentation for use as request
 * body content. Falls back to '{}' on serialization failure.
 */
export function stringifyJsonBody(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return '{}'
  }
}
