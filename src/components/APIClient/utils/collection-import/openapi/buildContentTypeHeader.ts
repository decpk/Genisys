import type { KeyValuePair } from '../../../APIClient.types'

/**
 * Builds an enabled `Content-Type` header KeyValuePair.
 */
export function buildContentTypeHeader(value: string): KeyValuePair {
  return { id: crypto.randomUUID(), key: 'Content-Type', value, enabled: true }
}
