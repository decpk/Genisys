import type { KeyValuePair } from '@/components/APIClient/APIClient.types'
import type { PostmanUrl } from './postman.types'
import { mapPostmanQueryParams } from './mapPostmanQueryParams'
import { splitRawUrl } from './splitRawUrl'
import { stripUrlQueryString } from './stripUrlQueryString'

interface MappedUrl {
  url: string
  params: KeyValuePair[]
}

/**
 * Resolve a Postman url (string OR `{ raw, query[] }`) into a clean url
 * (without its query string) plus the extracted query params.
 * `{{var}}` placeholders are preserved literally.
 */
export function mapPostmanUrl(url: string | PostmanUrl | undefined): MappedUrl {
  if (!url) return { url: '', params: [] }

  if (typeof url === 'string') return splitRawUrl(url)

  const raw = url.raw ?? ''

  if (Array.isArray(url.query) && url.query.length > 0) {
    return {
      url: stripUrlQueryString(raw),
      params: mapPostmanQueryParams(url.query),
    }
  }

  return splitRawUrl(raw)
}
