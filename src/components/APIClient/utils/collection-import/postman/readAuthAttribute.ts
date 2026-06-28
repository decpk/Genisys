import type { PostmanAuthAttribute } from './postman.types'

/**
 * Read a single auth attribute value (by key) from a Postman auth attribute
 * array. Postman stores auth params as `[{ key, value, type }]`.
 */
export function readAuthAttribute(
  attributes: PostmanAuthAttribute[] | undefined,
  key: string,
): string {
  if (!Array.isArray(attributes)) return ''

  const match = attributes.find((attribute) => attribute?.key === key)
  if (!match) return ''

  const value = match.value
  if (typeof value === 'string') return value
  if (value === undefined || value === null) return ''

  return String(value)
}
