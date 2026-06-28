/**
 * Tokenize a plain-text string into alternating text / url runs so callers
 * can render URLs as clickable elements while leaving the rest untouched.
 *
 * Storage stays plain text — linkification happens purely at render time.
 *
 * Heuristics:
 * - Matches `http(s)://…` and `www.…` sequences.
 * - Stops the URL at whitespace.
 * - Strips trailing punctuation `.,;:!?` and dangling closing brackets
 *   `)`, `]`, `}` that are unmatched relative to the URL body so a URL
 *   inside parentheses (e.g. "see (https://x.com)") doesn't swallow the
 *   `)`.
 * - Bare `www.…` URLs are surfaced with an `http://` prefix in `href`.
 */

export type LinkToken =
  | { kind: 'text'; value: string }
  | { kind: 'url'; value: string; href: string }

const URL_REGEX = /(https?:\/\/[^\s<>"']+|www\.[^\s<>"']+)/gi

const TRAILING_PUNCT_REGEX = /[.,;:!?]+$/

function stripTrailingNoise(raw: string): string {
  let url = raw

  // Drop trailing sentence punctuation.
  url = url.replace(TRAILING_PUNCT_REGEX, '')

  // Drop unmatched trailing brackets one at a time.
  // For each closing bracket at the end, only keep it if the URL contains
  // a matching opener.
  const pairs: Array<[string, string]> = [
    [')', '('],
    [']', '['],
    ['}', '{'],
  ]

  let changed = true
  while (changed) {
    changed = false
    const last = url[url.length - 1]
    if (!last) break

    // Re-check sentence punctuation in case stripping a bracket exposed it.
    const trimmed = url.replace(TRAILING_PUNCT_REGEX, '')
    if (trimmed !== url) {
      url = trimmed
      changed = true
      continue
    }

    for (const [close, open] of pairs) {
      if (last === close) {
        const opens = (url.match(new RegExp(`\\${open}`, 'g')) ?? []).length
        const closes = (url.match(new RegExp(`\\${close}`, 'g')) ?? []).length
        if (closes > opens) {
          url = url.slice(0, -1)
          changed = true
          break
        }
      }
    }
  }

  return url
}

export function tokenizeLinks(text: string): LinkToken[] {
  if (!text) return []

  const tokens: LinkToken[] = []
  let cursor = 0

  // Reset the regex's lastIndex per call (global flag preserves state across calls).
  URL_REGEX.lastIndex = 0

  let match: RegExpExecArray | null
  while ((match = URL_REGEX.exec(text)) !== null) {
    const rawUrl = match[0]
    const matchStart = match.index
    const cleanedUrl = stripTrailingNoise(rawUrl)

    // If stripping ate the entire match (shouldn't happen — defensive), skip.
    if (!cleanedUrl) continue

    // Push preceding text.
    if (matchStart > cursor) {
      tokens.push({ kind: 'text', value: text.slice(cursor, matchStart) })
    }

    const href = cleanedUrl.startsWith('www.') ? `http://${cleanedUrl}` : cleanedUrl
    tokens.push({ kind: 'url', value: cleanedUrl, href })

    cursor = matchStart + cleanedUrl.length

    // Rewind the regex cursor so stripped trailing chars (e.g. ".") become
    // the next text token rather than being lost.
    if (cleanedUrl.length < rawUrl.length) {
      URL_REGEX.lastIndex = cursor
    }
  }

  if (cursor < text.length) {
    tokens.push({ kind: 'text', value: text.slice(cursor) })
  }

  return tokens
}

/**
 * Quick test — does the string contain at least one URL?
 */
export function hasLink(text: string): boolean {
  if (!text) return false
  URL_REGEX.lastIndex = 0
  return URL_REGEX.test(text)
}
