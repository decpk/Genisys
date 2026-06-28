import { normalizeUrl } from './normalizeUrl'

/** True when `input` can be normalized into a fetchable http(s) URL. */
export function isValidUrl(input: string): boolean {
  return normalizeUrl(input) !== null
}
