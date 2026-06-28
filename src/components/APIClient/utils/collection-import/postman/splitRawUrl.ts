import type { KeyValuePair } from '@/components/APIClient/APIClient.types'
import { stripUrlQueryString } from './stripUrlQueryString'
import { parseQueryStringParams } from './parseQueryStringParams'

interface SplitRawUrlResult {
  url: string
  params: KeyValuePair[]
}

/**
 * Split a raw url string into its base url (without query string) and
 * the params parsed from its query string.
 */
export function splitRawUrl(raw: string): SplitRawUrlResult {
  const queryIndex = raw.indexOf('?')
  if (queryIndex === -1) return { url: raw, params: [] }

  return {
    url: stripUrlQueryString(raw),
    params: parseQueryStringParams(raw.slice(queryIndex + 1)),
  }
}
