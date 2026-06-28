import type { KeyValuePair } from '@/components/APIClient/APIClient.types'
import type { PostmanQueryParam } from './postman.types'

/**
 * Map a Postman `url.query[]` array into normalized query params.
 * Disabled entries are kept but marked `enabled: false`.
 */
export function mapPostmanQueryParams(query: PostmanQueryParam[] | undefined): KeyValuePair[] {
  if (!Array.isArray(query)) return []

  const result: KeyValuePair[] = []

  for (const param of query) {
    const key = param?.key ?? ''
    if (!key) continue

    result.push({
      id: crypto.randomUUID(),
      key,
      value: param?.value ?? '',
      enabled: param?.disabled !== true,
    })
  }

  return result
}
