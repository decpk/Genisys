/**
 * Stable identity for a tool call. We bucket on `name` + raw arguments
 * string (already serialized JSON) so callers don't have to canonicalise.
 */
export function hashToolCall(name: string, args: string): string {
  return `${name}::${args}`
}
