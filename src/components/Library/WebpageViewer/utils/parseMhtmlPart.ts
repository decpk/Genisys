import type { MhtmlResource } from './mhtml-parser.types'

/**
 * Parse a single MHTML part (between boundaries) into header fields and body content.
 */
export function parseMhtmlPart(
  partText: string,
): { contentType: string; contentLocation: string; encoding: string; body: string } | null {
  const headerBodySplit = partText.indexOf('\r\n\r\n')
  if (headerBodySplit === -1) {
    const altSplit = partText.indexOf('\n\n')
    if (altSplit === -1) return null

    const headers = partText.substring(0, altSplit)
    const body = partText.substring(altSplit + 2)
    return parseHeaders(headers, body)
  }

  const headers = partText.substring(0, headerBodySplit)
  const body = partText.substring(headerBodySplit + 4)
  return parseHeaders(headers, body)
}

function parseHeaders(
  headersText: string,
  body: string,
): { contentType: string; contentLocation: string; encoding: string; body: string } {
  const contentType = extractHeader(headersText, 'Content-Type') || 'application/octet-stream'
  const contentLocation = extractHeader(headersText, 'Content-Location') || ''
  const encoding = extractHeader(headersText, 'Content-Transfer-Encoding') || '7bit'

  return { contentType, contentLocation, encoding, body }
}

function extractHeader(headers: string, name: string): string | null {
  const regex = new RegExp(`^${name}:\\s*(.+?)$`, 'im')
  const match = headers.match(regex)
  return match ? match[1].trim() : null
}
