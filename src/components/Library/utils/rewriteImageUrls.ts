import type { CachedImageRecord } from '../types/cached-image-record'

/**
 * Rewrite remote `https://…` image URLs inside `markdown` to their offline
 * `library-image://…` counterparts, using the sidecar records.
 *
 * Only records with `status === 'ok'` are rewritten — failed downloads keep
 * their original URL so the renderer can fall back to the network.
 *
 * Returns the rewritten markdown unchanged when `records` is empty.
 */
export function rewriteImageUrls(
  markdown: string,
  records: CachedImageRecord[],
): string {
  if (!markdown || !records || records.length === 0) return markdown
  const map = new Map<string, string>()
  for (const rec of records) {
    if (rec.status === 'ok' && rec.local_url) {
      map.set(rec.url, rec.local_url)
    }
  }
  if (map.size === 0) return markdown

  // Replace inside the URL component of every `![alt](url)` directive.
  return markdown.replace(
    /(!\[[^\]]*\]\()([^)\s]+)((?:\s+"[^"]*")?\))/g,
    (whole, prefix, url, suffix) => {
      const replacement = map.get(url.trim())
      if (!replacement) return whole
      return `${prefix}${replacement}${suffix}`
    },
  )
}
