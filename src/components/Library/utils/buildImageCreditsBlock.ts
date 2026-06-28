import type { CachedImageRecord } from '../types/cached-image-record'
import { extractDomainFromUrl } from './extractDomainFromUrl'

/**
 * Build the `## Image Credits` markdown block that appears at the bottom of a
 * chapter. Lists every image that was successfully cached together with its
 * source domain and a clickable link to the original. Returns an empty string
 * when no images were cached so we never emit a stray empty section.
 */
export function buildImageCreditsBlock(records: CachedImageRecord[]): string {
  if (!records || records.length === 0) return ''
  const ok = records.filter((r) => r.status === 'ok' && r.url)
  if (ok.length === 0) return ''

  const lines: string[] = ['## Image Credits', '']
  ok.forEach((r, idx) => {
    const domain = r.source_domain || extractDomainFromUrl(r.url)
    lines.push(`${idx + 1}. *${domain}* — [${r.url}](${r.url})`)
  })
  lines.push('')
  return lines.join('\n')
}
