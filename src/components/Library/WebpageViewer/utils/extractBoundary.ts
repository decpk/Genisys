import type { MhtmlResource } from './mhtml-parser.types'

/**
 * Extract the MIME boundary string from the MHTML Content-Type header.
 */
export function extractBoundary(mhtml: string): string | null {
  const match = mhtml.match(/boundary="([^"]+)"/)
  if (match) return match[1]

  const altMatch = mhtml.match(/boundary=(\S+)/)
  if (altMatch) return altMatch[1]

  return null
}
