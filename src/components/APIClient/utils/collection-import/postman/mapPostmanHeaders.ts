import type { KeyValuePair } from '@/components/APIClient/APIClient.types'
import type { PostmanHeader } from './postman.types'

/**
 * Convert Postman request headers into normalized KeyValuePairs.
 * `{{var}}` placeholders are preserved literally.
 */
export function mapPostmanHeaders(headers: PostmanHeader[] | undefined): KeyValuePair[] {
  if (!Array.isArray(headers)) return []

  const result: KeyValuePair[] = []

  for (const header of headers) {
    const key = header?.key ?? ''
    if (!key) continue

    result.push({
      id: crypto.randomUUID(),
      key,
      value: header?.value ?? '',
      enabled: header?.disabled !== true,
    })
  }

  return result
}
