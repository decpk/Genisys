/**
 * Normalizes the many shapes of raw error strings into a clean, presentable
 * form. Handles HTML error pages (collapsed to readable text), stderr of the
 * form "… Error: <real message>", and plain error strings.
 *
 * Pure + dependency-free so it is trivially testable.
 */
export interface ParsedReviewerError {
  /** Short headline for the error card. */
  title: string
  /** Human-readable explanation, cleaned of raw noise. */
  message: string
  /** Raw payload for the collapsible "Details" section, or null when there is nothing extra to show. */
  details: string | null
  /** Optional external help link. */
  link?: { href: string; label: string }
}

/** True when the string contains real HTML structure (not just a stray `<`). */
function looksLikeHtml(raw: string): boolean {
  return (
    /<!doctype\s+html/i.test(raw) ||
    /<html[\s>]/i.test(raw) ||
    /<\/(?:div|a|span|p|body|html|button|section|h[1-6])>/i.test(raw) ||
    /<(?:div|a|br|p|span|button|section|img|h[1-6])\b[^>]*>/i.test(raw)
  )
}

/** Collapse an HTML blob into a single line of readable text. */
function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#\d+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function truncate(text: string, max = 240): string {
  if (text.length <= max) return text
  return `${text.slice(0, max - 1).trimEnd()}…`
}

export function parseReviewerError(
  raw: string | null | undefined,
  fallbackMessage = 'Something went wrong.',
): ParsedReviewerError {
  const input = (raw ?? '').trim()
  if (!input) {
    return { title: 'Error', message: fallbackMessage, details: null }
  }

  // ── HTML error page (collapsed to readable text) ──
  if (looksLikeHtml(input)) {
    const isAccessDenied =
      /already have access/i.test(input) ||
      /request access/i.test(input) ||
      /don'?t have (?:permission|access)/i.test(input) ||
      /not authorized|unauthorized|sign\s?in|403|forbidden/i.test(input)

    if (isAccessDenied) {
      return {
        title: 'Access denied',
        message:
          "You don't have permission to view this resource. Ask an administrator for access, then retry.",
        details: input,
      }
    }

    const text = htmlToText(input)
    return {
      title: "Couldn't load",
      message: truncate(text) || fallbackMessage,
      details: input,
    }
  }

  // ── stderr ("… Error: <real message>") ──
  const errorIdx = input.toLowerCase().lastIndexOf('error:')
  if (errorIdx !== -1) {
    const message = input.slice(errorIdx + 'error:'.length).trim()
    if (message) {
      const hasNoise =
        /log directory:|waiting for log cleanup/i.test(input) ||
        input.length > message.length + 8
      return {
        title: 'Request failed',
        message: truncate(message),
        details: hasNoise ? input : null,
      }
    }
  }

  // ── Plain string ──
  return {
    title: 'Error',
    message: truncate(input) || fallbackMessage,
    details: input.length > 240 ? input : null,
  }
}
