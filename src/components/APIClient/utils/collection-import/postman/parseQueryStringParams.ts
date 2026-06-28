import type { KeyValuePair } from '@/components/APIClient/APIClient.types'
import { safeDecodeUriComponent } from './safeDecodeUriComponent'

/**
 * Parse a raw query string (the part after `?`) into normalized params.
 * `{{var}}` placeholders are preserved literally.
 */
export function parseQueryStringParams(queryString: string): KeyValuePair[] {
  if (!queryString) return []

  const result: KeyValuePair[] = []
  const segments = queryString.split('&')

  for (const segment of segments) {
    if (!segment) continue

    const eqIndex = segment.indexOf('=')
    let rawKey = segment
    let rawValue = ''

    if (eqIndex !== -1) {
      rawKey = segment.slice(0, eqIndex)
      rawValue = segment.slice(eqIndex + 1)
    }

    const key = safeDecodeUriComponent(rawKey)
    if (!key) continue

    result.push({
      id: crypto.randomUUID(),
      key,
      value: safeDecodeUriComponent(rawValue),
      enabled: true,
    })
  }

  return result
}
