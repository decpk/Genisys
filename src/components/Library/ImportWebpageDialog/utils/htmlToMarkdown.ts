import TurndownService from 'turndown'

let cachedService: TurndownService | null = null

function getService(): TurndownService {
  if (cachedService) return cachedService
  cachedService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
  })
  return cachedService
}

/** Convert an HTML string into markdown using turndown. */
export function htmlToMarkdown(html: string): string {
  const trimmed = html.trim()
  if (!trimmed) return ''
  return getService().turndown(trimmed)
}
