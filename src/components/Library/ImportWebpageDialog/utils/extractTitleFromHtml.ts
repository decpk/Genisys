/**
 * Best-effort extraction of a human-readable title from an HTML string.
 * Prefers the <title> tag, then the first <h1>. Returns '' when neither exists.
 */
export function extractTitleFromHtml(html: string): string {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  if (titleMatch) {
    const title = stripTags(titleMatch[1]).trim()
    if (title) return title
  }

  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
  if (h1Match) {
    const heading = stripTags(h1Match[1]).trim()
    if (heading) return heading
  }

  return ''
}

function stripTags(value: string): string {
  return value.replace(/<[^>]*>/g, '')
}
