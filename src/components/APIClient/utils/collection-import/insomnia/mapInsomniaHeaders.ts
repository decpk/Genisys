import type { KeyValuePair } from '../../../APIClient.types'
import type { InsomniaHeader } from './insomnia.types'

/**
 * Convert Insomnia request headers into normalized key-value pairs.
 * A header is enabled unless it is explicitly marked `disabled`.
 */
export function mapInsomniaHeaders(
  headers: InsomniaHeader[] | undefined
): KeyValuePair[] {
  return (headers ?? []).map((header) => ({
    id: crypto.randomUUID(),
    key: header.name ?? '',
    value: header.value ?? '',
    enabled: !header.disabled,
  }))
}
