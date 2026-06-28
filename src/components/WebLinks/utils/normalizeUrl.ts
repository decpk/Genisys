/**
 * Normalize raw user input into a fetchable absolute http(s) URL, or return
 * `null` when it cannot be interpreted as one.
 *
 * - Trims surrounding whitespace.
 * - Prepends `https://` when no scheme is present.
 * - Rejects non-http(s) schemes and hostnames without a dot (e.g. `localhost`
 *   typos), validating via the native `URL` parser.
 */
export function normalizeUrl(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  let candidate = trimmed
  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate}`
  }

  try {
    const parsed = new URL(candidate)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null
    if (!parsed.hostname.includes('.')) return null
    return parsed.toString()
  } catch {
    return null
  }
}
