/**
 * Extract every external image URL (`http://` / `https://`) referenced by a
 * markdown `![alt](url)` directive. Order preserved, duplicates removed.
 *
 * Mirrors the Rust counterpart in
 * `src-tauri/src/commands/library/image_cache/extract_image_urls.rs`.
 */
export function extractImageUrls(markdown: string): string[] {
  if (!markdown) return []
  const re = /!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g
  const out: string[] = []
  const seen = new Set<string>()
  let match: RegExpExecArray | null
  while ((match = re.exec(markdown)) !== null) {
    const url = (match[1] || '').trim()
    if (!url) continue
    if (!/^https?:\/\//i.test(url)) continue
    if (seen.has(url)) continue
    seen.add(url)
    out.push(url)
  }
  return out
}
