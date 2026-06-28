/**
 * Return a url with its query string (everything from `?` onward) removed.
 */
export function stripUrlQueryString(raw: string): string {
  const queryIndex = raw.indexOf('?')
  if (queryIndex === -1) return raw
  return raw.slice(0, queryIndex)
}
