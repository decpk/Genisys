/**
 * Extract the hostname from a URL for display (e.g. "https://a.b/c" → "a.b").
 * Returns the original string when it cannot be parsed as a URL.
 */
export function getHostname(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}
