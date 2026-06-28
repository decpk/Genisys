/**
 * Best-effort host extraction for a URL. Falls back to the original string
 * if parsing fails (e.g. malformed URL).
 */
export function extractDomainFromUrl(url: string): string {
  try {
    return new URL(url).host || url
  } catch {
    return url
  }
}
