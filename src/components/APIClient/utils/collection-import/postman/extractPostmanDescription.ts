/**
 * Extract a plain-string description from a Postman `description` field, which
 * may be a string, an object `{ content }`, or absent.
 */
export function extractPostmanDescription(
  description: string | { content?: string } | undefined,
): string {
  if (!description) return ''
  if (typeof description === 'string') return description
  if (typeof description.content === 'string') return description.content
  return ''
}
