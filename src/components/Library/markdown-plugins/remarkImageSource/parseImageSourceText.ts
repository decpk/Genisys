//! Parse the body of a `*Source: ...*` italic paragraph into structured pieces.
//!
//! Accepted forms (all italic, on a single paragraph):
//!   *Source: Title — domain ([domain](https://full/url))*
//!   *Source: Title — [domain](https://full/url)*
//!   *Source: [domain](https://full/url)*
//!   *Source: domain*
//!
//! Returns whatever we can confidently extract; missing pieces are `undefined`.

export interface ParsedImageSource {
  /** Free-form label such as "Wikimedia Commons". Falls back to domain. */
  label?: string
  /** Host of the source URL (e.g. "commons.wikimedia.org"). */
  domain?: string
  /** Full URL the source line links to. */
  url?: string
}

const SOURCE_PREFIX = /^\s*source\s*:\s*/i

/**
 * Parse the raw text of an italic source paragraph (the text WITHIN the
 * surrounding asterisks). The first `[label](url)` markdown link in the
 * string wins as the canonical URL; everything before the URL is treated
 * as the human-readable label.
 */
export function parseImageSourceText(raw: string): ParsedImageSource {
  if (!raw) return {}
  const cleaned = raw.replace(SOURCE_PREFIX, '').trim()
  if (!cleaned) return {}

  const linkMatch = cleaned.match(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/i)
  let url: string | undefined
  let domain: string | undefined
  if (linkMatch) {
    url = linkMatch[2]
    try {
      domain = new URL(url).host
    } catch {
      domain = linkMatch[1]
    }
  }

  // Label: everything before the link, with separator characters trimmed
  let label: string | undefined
  if (linkMatch) {
    label = cleaned.slice(0, linkMatch.index ?? 0)
  } else {
    label = cleaned
  }
  label = label?.replace(/[—–\-•|·,\s]+$/g, '').trim() || undefined

  if (!label && domain) label = domain
  if (!domain && label && /^[\w.-]+\.[a-z]{2,}$/i.test(label)) {
    domain = label
  }

  return { label, domain, url }
}
