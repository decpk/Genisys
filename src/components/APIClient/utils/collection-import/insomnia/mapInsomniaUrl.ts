import type { KeyValuePair } from '../../../APIClient.types'
import type { InsomniaParameter } from './insomnia.types'

/**
 * Split any query string off the request url and merge it with the
 * structured `parameters[]` array into a single list of query params.
 * The returned url has its query string removed.
 */
export function mapInsomniaUrl(
  url: string | undefined,
  parameters: InsomniaParameter[] | undefined
): { url: string; params: KeyValuePair[] } {
  const rawUrl = url ?? ''
  const params: KeyValuePair[] = []

  const queryIndex = rawUrl.indexOf('?')
  const baseUrl = queryIndex === -1 ? rawUrl : rawUrl.slice(0, queryIndex)
  const queryString = queryIndex === -1 ? '' : rawUrl.slice(queryIndex + 1)

  for (const pair of parseQueryString(queryString)) {
    params.push({
      id: crypto.randomUUID(),
      key: pair.key,
      value: pair.value,
      enabled: true,
    })
  }

  for (const parameter of parameters ?? []) {
    params.push({
      id: crypto.randomUUID(),
      key: parameter.name ?? '',
      value: parameter.value ?? '',
      enabled: !parameter.disabled,
    })
  }

  return { url: baseUrl, params }
}

function parseQueryString(queryString: string): Array<{ key: string; value: string }> {
  if (!queryString) return []

  return queryString.split('&').map((segment) => {
    const eqIndex = segment.indexOf('=')
    if (eqIndex === -1) return { key: safeDecode(segment), value: '' }
    return {
      key: safeDecode(segment.slice(0, eqIndex)),
      value: safeDecode(segment.slice(eqIndex + 1)),
    }
  })
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}
