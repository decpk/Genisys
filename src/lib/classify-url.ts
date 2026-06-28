export type UrlKind = 'ado-pr' | 'ado-workitem' | 'generic'

export interface ClassifiedUrl {
  kind: UrlKind
  /** Compact label suitable for rendering inside a chip or short anchor. */
  label: string
  /** Optional secondary line / tooltip detail. */
  detail?: string
  /** Original URL. */
  url: string
  /** Open inside Genisys (when available) instead of the browser. */
  deepLink?: () => void
}

/**
 * Build a short, readable label for a generic URL.
 *
 * Examples:
 *   https://example.com                              -> example.com
 *   https://example.com/                             -> example.com
 *   https://example.com/path                         -> example.com/path
 *   https://example.com/very/long/path?x=1           -> example.com/…/path
 *   https://example.com/very/long/path/              -> example.com/…/path
 */
export function shortenUrl(url: string): string {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace(/^www\./, '')
    const segments = parsed.pathname.split('/').filter(Boolean)
    if (segments.length === 0) return host
    if (segments.length === 1) return `${host}/${segments[0]}`
    return `${host}/…/${segments[segments.length - 1]}`
  } catch {
    return url
  }
}

/**
 * Classify a URL into a kind + display label. All URLs are treated as
 * `generic` short-label entries.
 */
export function classifyUrl(url: string): ClassifiedUrl {
  return {
    kind: 'generic',
    label: shortenUrl(url),
    url,
  }
}
