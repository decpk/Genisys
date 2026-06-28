/**
 * Stable hash for a stock news article, used to de-duplicate across
 * Yahoo Finance + AI-generated news while preserving order.
 *
 * Built from title (lowercased, trimmed) + canonical url (without query
 * string / hash) when present.
 */
export function articleHash(title: string, url: string | null | undefined): string {
  const t = (title ?? '').trim().toLowerCase()
  let u = ''
  if (url) {
    try {
      const parsed = new URL(url)
      u = `${parsed.hostname}${parsed.pathname}`.toLowerCase()
    } catch {
      u = url.toLowerCase()
    }
  }
  return `${t}::${u}`
}
