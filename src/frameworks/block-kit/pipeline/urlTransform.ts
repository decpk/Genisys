import { defaultUrlTransform } from 'react-markdown'

/**
 * URL transform that lets a set of custom schemes pass through untouched (e.g.
 * `library-image:`) while delegating everything else to react-markdown's safe
 * default (which strips `javascript:` etc.).
 */
export function createUrlTransform(
  allowedSchemes: readonly string[] = [],
): (url: string) => string {
  if (allowedSchemes.length === 0) return defaultUrlTransform
  return (url: string) => {
    const lower = url.toLowerCase()
    for (const scheme of allowedSchemes) {
      if (lower.startsWith(`${scheme}:`)) return url
    }
    return defaultUrlTransform(url)
  }
}
